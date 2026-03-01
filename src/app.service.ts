import { Injectable, OnModuleInit } from '@nestjs/common';
import { AdminService } from './api/admin/admin.service';
import { RoleService } from './api/role/role.service';
import { UserService } from './api/user/user.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly adminService: AdminService,
    private readonly roleService: RoleService,
    private readonly userService: UserService
  ) { }

  async onModuleInit() {
    await this.roleService.seedRoles();
    console.log('Role seeding completed');
    await this.adminService.seedDefaultAdmins();
    console.log('Admin seeding completed');
    await this.userService.seedDefaultUsers();
    console.log('User seeding completed');
  }

  getHello(): string {
    return 'Hello World!';
  }
}
