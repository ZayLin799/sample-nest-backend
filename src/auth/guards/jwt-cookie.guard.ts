import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Injectable()
export class JwtCookieGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.cookies?.game_setting_token;

    if (!token) throw new UnauthorizedException('Authentication token missing');

    try {
      // payload matches what you put in generateToken(...)
      const payload = this.jwtService.verify(token);
      // Attach user info including role for role-based guards
      (req as any).user = {
        id: payload.id,
        email: payload.email,
        username: payload.username,
        userType: payload.userType,
        role: payload.role, // Role enum value for role-based access control
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
