import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';
import { Request } from 'express';

function normalizeIp(ip = '') {
  return ip.replace(/^::ffff:/, '');
}

type SecretIpGuardOption = boolean | { ip?: boolean };

export function SecretIpGuard(option?: SecretIpGuardOption): Type<CanActivate> {
  const opts = typeof option === 'boolean' ? { ip: option } : (option ?? {});

  @Injectable()
  class SecretIpGuardMixin implements CanActivate {
    private getAllowed(): Set<string> {
      const raw = process.env.ALLOWED_IPS || '';
      return new Set(
        raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .map(normalizeIp)
      );
    }

    private get secretKey() {
      return process.env.PUBLIC_ROOM_SECRET || 'my-secret-key';
    }

    canActivate(context: ExecutionContext): boolean {
      const req: Request = context.switchToHttp().getRequest();

      const xff = (req.headers['x-forwarded-for'] as string) || '';
      const clientIp = normalizeIp(
        (xff.split(',')[0]?.trim() || req.socket.remoteAddress || '').trim()
      );

      const allowed = this.getAllowed();
      const shouldCheckIp =
        typeof opts.ip === 'boolean' ? opts.ip : allowed.size > 0;

      if (shouldCheckIp && !allowed.has(clientIp)) {
        throw new ForbiddenException('Access denied: invalid IP');
      }

      const key = req.headers['x-api-key'] as string;
      if (key !== this.secretKey) {
        throw new ForbiddenException('Access denied: invalid secret key');
      }

      return true;
    }
  }

  return mixin(SecretIpGuardMixin);
}
