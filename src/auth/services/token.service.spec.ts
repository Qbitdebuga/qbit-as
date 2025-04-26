import { Test, TestingModule } from '@nestjs/testing';
import { TokenService, JwtPayload } from './token.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

describe('TokenService', () => {
  let service: TokenService;
  let configService: ConfigService;

  const mockConfig: Record<string, string> = {
    'app.jwt.secret': 'test-secret',
    'app.jwt.expiresIn': '1h',
    'app.jwt.refreshExpiresIn': '7d',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              return mockConfig[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const payload: Omit<JwtPayload, 'type'> = {
        sub: '123',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
      };

      const tokens = service.generateTokens(payload);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(tokens).toHaveProperty('expiresIn');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
      expect(typeof tokens.expiresIn).toBe('number');
    });
  });

  describe('validateAccessToken', () => {
    it('should validate a valid access token', () => {
      const payload: JwtPayload = {
        sub: '123',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        type: 'access',
      };

      const token = service.generateTokens(payload).accessToken;
      const decodedPayload = service.validateAccessToken(token);

      expect(decodedPayload).toHaveProperty('sub', payload.sub);
      expect(decodedPayload).toHaveProperty('username', payload.username);
      expect(decodedPayload).toHaveProperty('email', payload.email);
      expect(decodedPayload.roles).toEqual(payload.roles);
      expect(decodedPayload).toHaveProperty('type', 'access');
    });

    it('should throw for an invalid token type', () => {
      const payload: JwtPayload = {
        sub: '123',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        type: 'refresh', // This is incorrect for access validation
      };

      const token = service.generateTokens(payload).refreshToken;
      
      expect(() => {
        service.validateAccessToken(token);
      }).toThrow(UnauthorizedException);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract a token from a valid authorization header', () => {
      const token = 'valid-token';
      const authHeader = `Bearer ${token}`;
      
      const extractedToken = service.extractTokenFromHeader(authHeader);
      
      expect(extractedToken).toBe(token);
    });

    it('should return null for an invalid header format', () => {
      const authHeader = 'InvalidFormat token123';
      
      const extractedToken = service.extractTokenFromHeader(authHeader);
      
      expect(extractedToken).toBeNull();
    });

    it('should return null for a null or undefined header', () => {
      expect(service.extractTokenFromHeader(null as any)).toBeNull();
      expect(service.extractTokenFromHeader(undefined as any)).toBeNull();
    });
  });
}); 