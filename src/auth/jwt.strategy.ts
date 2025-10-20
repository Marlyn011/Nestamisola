import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(), // Standard Bearer token
        (req) => req?.query?.token || null, // Optional fallback (token in query)
      ]),
      ignoreExpiration: false, // Reject expired tokens
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET || 'access_secret', // Secret for verification
    });
  }

  /**
   * Validate method runs after successful token verification.
   * Whatever is returned here will be attached to req.user.
   */
  async validate(payload: any) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid or missing JWT payload');
    }

    // Attach user details to req.user
    return {
      id: payload.sub, // Use 'id' to match typical user table field
      username: payload.username,
      role: payload.role,
    };
  }
}