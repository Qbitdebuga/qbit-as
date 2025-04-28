import { Injectable, UnauthorizedException, ForbiddenException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }

  async register(registerDto: RegisterDto) {
    // Verify passwords match
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException("Passwords don't match");
    }
    
    try {
      // Create the user
      const user = await this.userService.create({
        email: registerDto.email,
        name: registerDto.name,
        password: registerDto.password,
        roles: registerDto.roles || ['user'],
      });
      
      // Generate tokens
      const tokens = await this.getTokens(user.id, user.email, user.roles);
      
      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
        },
      };
    } catch (error: unknown) {
      // Handle Prisma unique constraint error
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email already in use');
      }
      
      // Handle other errors that might include a message about email uniqueness
      if (error instanceof Error && error.message.includes('email already exists')) {
        throw new ConflictException('Email already in use');
      }
      
      throw error;
    }
  }

  async forgotPassword(email: string) {
    // Check if user exists
    const user = await this.userService.findByEmail(email);
    
    // For security reasons, don't reveal if the email exists or not
    if (!user) {
      return { message: 'If your email is registered, you will receive a password reset link' };
    }
    
    // Generate a password reset token
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'password-reset' },
      { 
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m' 
      }
    );
    
    // In a real-world app, send an email with the reset token
    // For now, just return the token for testing purposes
    return { 
      message: 'If your email is registered, you will receive a password reset link',
      // The following would not be exposed in production
      debug: { token, userId: user.id } 
    };
  }

  async resetPassword(token: string, password: string, confirmPassword: string) {
    // Verify passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException("Passwords don't match");
    }
    
    try {
      // Verify token
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      
      // Check if this is a password reset token
      if (decoded.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid token type');
      }
      
      // Find user
      const user = await this.userService.findById(decoded.sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      // Update user's password
      await this.userService.update(user.id, { password });
      
      return { message: 'Password reset successful' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async login(user: any) {
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const tokens = await this.getTokens(user.id, user.email, user.roles);
    
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      // Verify refresh token
      const decoded = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Get user
      const user = await this.userService.findById(decoded.sub);
      if (!user) {
        throw new ForbiddenException('Access denied');
      }

      // Generate new tokens
      return this.getTokens(user.id, user.email, user.roles);
    } catch (error) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  private async getTokens(userId: string, email: string, roles: string[]) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          roles,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          roles,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
} 