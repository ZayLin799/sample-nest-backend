import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { AdminAuthModule } from '../../auth/admin-auth/admin-auth.module';

@Module({
  imports: [AdminAuthModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule { }
