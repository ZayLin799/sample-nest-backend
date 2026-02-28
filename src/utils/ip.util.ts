// src/common/utils/ip.util.ts
import type { Request } from 'express';

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export function getClientIp(req: Request | any): string {
  let ip: string | undefined;

  // Prefer proxy header
  const xff = req?.headers?.['x-forwarded-for'];
  if (Array.isArray(xff)) {
    ip = xff[0];
  } else if (typeof xff === 'string') {
    ip = xff.split(',')[0].trim();
  }

  // Fallbacks
  if (!ip) {
    ip =
      req?.ip || req?.socket?.remoteAddress || req?.connection?.remoteAddress;
  }

  // Normalize
  if (ip === '::1') return '127.0.0.1';
  if (ip?.startsWith('::ffff:')) return ip.slice(7);

  return ip ?? '';
}
