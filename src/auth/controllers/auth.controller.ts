import { 
  Body, 
  Controller, 
  Get, 
  HttpCode, 
  HttpStatus, 
  Post, 
  Req, 
  Res, 
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { TokenService } from '../services/token.service';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto, UserDto } from '../dto/auth-response.dto';
import * as crypto from 'crypto';
import { JwtPayload } from '../services/token.service';
import { CsrfGuard } from '../guards/csrf.guard';

/**
 * Authentication controller for user login/logout operations
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Authenticate a user and set JWT cookies
   * 
   * @param loginDto Login credentials
   * @param res Express response object for setting cookies
   * @returns Auth response with user info
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    // For now, we mock the authentication process
    // In a real implementation, we would validate credentials against the auth service
    
    if (loginDto.email !== 'user@example.com' || loginDto.password !== 'password123') {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Mock user data
    const user: UserDto = {
      id: '1',
      email: loginDto.email,
      name: 'Example User',
      roles: ['user'],
    };

    // In a real implementation, we would get the user ID and roles from the auth service
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.name || user.email.split('@')[0],
      roles: user.roles,
    };

    // Generate tokens
    const tokens = this.tokenService.generateTokens(payload);
    
    // Generate CSRF token
    const csrfToken = crypto.randomBytes(16).toString('hex');

    // Configure cookie options
    const cookieOptions = {
      httpOnly: this.configService.get<boolean>('app.cookie.httpOnly', true),
      secure: this.configService.get<boolean>('app.cookie.secure', false),
      sameSite: this.configService.get<boolean | 'lax' | 'strict' | 'none'>('app.cookie.sameSite', 'lax'),
      path: '/',
    };

    // Set cookies
    res.cookie('access_token', tokens.accessToken, {
      ...cookieOptions,
      maxAge: tokens.expiresIn * 1000, // Convert to milliseconds
    });
    
    res.cookie('refresh_token', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: loginDto.rememberMe 
        ? this.configService.get<number>('app.cookie.maxAge', 7 * 24 * 60 * 60 * 1000) // 7 days
        : 24 * 60 * 60 * 1000, // 1 day
    });
    
    res.cookie('XSRF-TOKEN', csrfToken, {
      ...cookieOptions,
      httpOnly: false, // CSRF token must be readable by JavaScript
    });

    // Return auth response (without tokens since they're in cookies)
    return {
      expiresIn: tokens.expiresIn,
      user,
      csrfToken,
    };
  }

  /**
   * Log out the current user by clearing auth cookies
   * 
   * @param res Express response object for clearing cookies
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(CsrfGuard)
  logout(@Res({ passthrough: true }) res: Response): { success: boolean } {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie('XSRF-TOKEN');
    
    return { success: true };
  }

  /**
   * Refresh the access token using a refresh token cookie
   * 
   * @param req Express request object for getting cookies
   * @param res Express response object for setting cookies
   * @returns Auth response with new token details
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(CsrfGuard)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ expiresIn: number }> {
    const refreshToken = req.cookies.refresh_token;
    
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    
    try {
      // Generate new token pair
      const tokens = this.tokenService.refreshTokens(refreshToken);
      
      // Set new access token cookie
      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: this.configService.get<boolean>('app.cookie.secure', false),
        sameSite: this.configService.get<boolean | 'lax' | 'strict' | 'none'>('app.cookie.sameSite', 'lax'),
        maxAge: tokens.expiresIn * 1000,
        path: '/',
      });
      
      return { expiresIn: tokens.expiresIn };
    } catch (error) {
      // Clear cookies on error
      this.logout(res);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Get the currently authenticated user's profile
   * 
   * @param req Express request object
   * @returns Current user information
   */
  @Get('profile')
  async getProfile(@Req() req: Request): Promise<UserDto> {
    try {
      const token = req.cookies.access_token;
      
      if (!token) {
        throw new UnauthorizedException('No access token provided');
      }
      
      const payload = this.tokenService.validateAccessToken(token);
      
      // Mock user data based on token payload
      return {
        id: payload.sub,
        email: payload.email || '',
        name: payload.username || '',
        roles: payload.roles || [],
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }
} 