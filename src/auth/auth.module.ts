// JWT secret and expiration values are pulled from environment variables.
// If not defined, defaults are used:
// secret: 'access_secret'
// expiresIn: '900s' (15 minutes)
// Used `JwtModule.register()` for static configuration with environment fallback.

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET || 'access_secret',
      signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '900s' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}