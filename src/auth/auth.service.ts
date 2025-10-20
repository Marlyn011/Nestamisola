// Removed duplicate DB lookups during refresh token validation.
// Added clearer error handling with proper messages.
// Login now returns a structured object with metadata (userId, username, role).
// Refresh token logic simplified to reduce multiple redundant queries.
// Added better comments explaining token creation and refresh.
// Both tokens return consistent objects with "accessToken" and "refreshToken".

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) return null;

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) return null;

    return { id: user.id, username: user.username, role: user.role };
  }

  async login(user: { id: number; username: string; role: string }) {
    const payload = { sub: user.id, username: user.username, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    });

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' },
    );

    await this.usersService.setRefreshToken(user.id, refreshToken);

    return {
      message: 'Login successful',
      user: { id: user.id, username: user.username, role: user.role },
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: number) {
    await this.usersService.setRefreshToken(userId, null);
    return { success: true, message: 'User logged out' };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const decoded: any = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
      );

      const user = await this.usersService.findById(decoded.sub);
      if (!user) throw new UnauthorizedException('User not found');

      const storedUser = await this.usersService.findByRefreshToken(refreshToken);
      if (!storedUser) throw new UnauthorizedException('Invalid refresh token');

      const payload = {
        sub: user.id,
        username: user.username,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
      });

      const newRefreshToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' },
      );

      await this.usersService.setRefreshToken(user.id, newRefreshToken);

      return {
        message: 'Token refreshed successfully',
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      throw new UnauthorizedException('Could not refresh tokens');
    }
  }
}