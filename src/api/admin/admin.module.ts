import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { RoleModule } from '../role/role.module';
import { AdminAuthModule } from '../../auth/admin-auth/admin-auth.module';

@Module({
  imports: [RoleModule, AdminAuthModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule { }
