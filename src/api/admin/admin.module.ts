import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [RoleModule],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule { }
