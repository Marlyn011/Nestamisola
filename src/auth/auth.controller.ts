// Added better error handling for login and logout.
// Logout now checks if the user exists before logging out.
// Register returns a cleaner response object instead of raw DB result.
// Added status messages for better API client understanding.
// Refresh now includes error handling if refresh token is invalid.

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    const newUser = await this.usersService.createUser(
      body.username,
      body.password,
    );
    return { message: 'User successfully registered!', user: newUser };
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    if (!user) {
      return { error: true, message: 'Invalid username or password' };
    }
    return {
      message: 'Login successful',
      tokens: await this.authService.login(user),
    };
  }

  @Post('logout')
  async logout(@Body() body: { userId: number }) {
    const user = await this.usersService.findById(body.userId);
    if (!user) {
      return { error: true, message: 'User not found' };
    }
    await this.authService.logout(body.userId);
    return { message: 'Logout successful' };
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    const tokens = await this.authService.refreshTokens(body.refreshToken);
    if (!tokens) {
      return { error: true, message: 'Invalid refresh token' };
    }
    return { message: 'Token refreshed successfully', tokens };
  }
}