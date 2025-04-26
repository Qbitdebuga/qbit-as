import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ConfigModuleOptions } from './config/config.module';
import { CsrfMiddleware } from './middleware/csrf.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ConfigModuleOptions],
      envFilePath: ['.env.local', '.env'],
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply CSRF middleware to all routes that aren't excluded
    consumer
      .apply(CsrfMiddleware)
      .forRoutes('*');
  }
} 