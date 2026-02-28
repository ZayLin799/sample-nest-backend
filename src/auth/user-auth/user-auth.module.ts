import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserAuthService } from './user-auth.service';
import { UserAuthController } from './user-auth.controller';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';

@Module({
  imports: [
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: cfg.get('JWT_EXPIRES_IN') || '7d' },
      }),
    }),
  ],
  controllers: [UserAuthController],
  providers: [UserAuthService, RolesGuard],
  exports: [JwtModule, UserAuthService, RolesGuard],
})
export class UserAuthModule { }
