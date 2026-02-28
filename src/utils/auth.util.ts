import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

const config = new ConfigService();

export function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: any): string {
  const secret = config.get<string>('JWT_SECRET');
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '7d',
  });
}
