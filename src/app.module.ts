import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminAuthModule } from './auth/admin-auth/admin-auth.module';
import { UserAuthModule } from './auth/user-auth/user-auth.module';
import { AdminModule } from './api/admin/admin.module';
import { RoleModule } from './api/role/role.module';
import { UserModule } from './api/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AdminAuthModule,
    UserAuthModule,
    AdminModule,
    RoleModule,
    UserModule,
    WebsocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
