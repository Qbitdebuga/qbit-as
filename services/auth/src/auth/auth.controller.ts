import { Controller, Post, Get, Body, HttpCode, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import { JwtAuthGuard } from './guards/jwt.guard.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { ServiceTokenRequestDto } from './dto/service-token-request.dto.js';
import { ServiceTokenService } from './services/service-token.service.js';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly serviceTokenService: ServiceTokenService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Request() req: { user: any }) {
    return this.authService.login(req.user);
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request a password reset' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
      resetPasswordDto.confirmPassword
    );
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token refresh successful' })
  @ApiResponse({ status: 403, description: 'Invalid refresh token' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req: { user: any }) {
    return req.user;
  }

  @Post('service-token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request a service-to-service authentication token' })
  @ApiBody({ type: ServiceTokenRequestDto })
  @ApiResponse({ status: 200, description: 'Service token generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid API key' })
  async getServiceToken(@Body() serviceTokenRequestDto: ServiceTokenRequestDto) {
    // Validate API key using the environment variables
    // Convert service name to uppercase and replace hyphens with underscores for env var naming
    const serviceEnvName = serviceTokenRequestDto.serviceName
      .toUpperCase()
      .replace(/-/g, '_');
    
    const validApiKey = this.configService.get<string>(`SERVICE_API_KEY_${serviceEnvName}`);
    
    if (!validApiKey || validApiKey !== serviceTokenRequestDto.apiKey) {
      throw new UnauthorizedException('Invalid API key for service');
    }
    
    // Generate service token
    const token = await this.serviceTokenService.generateServiceToken(
      serviceTokenRequestDto.serviceName,
      serviceTokenRequestDto.scope,
      serviceTokenRequestDto.expiresIn,
    );
    
    return { token };
  }
} 