import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RoleService } from '../role/role.service';
import { RoleEnum } from '../../enum/role.enum';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleService: RoleService
  ) { }

  async seedDefaultAdmins() {
    const adminsToSeed = [
      { username: 'root', email: 'root@gmail.com', role: RoleEnum.ROOT },
      { username: 'dev', email: 'dev@gmail.com', role: RoleEnum.DEVELOPER },
    ];

    for (const adminData of adminsToSeed) {
      const exists = await this.prisma.admin.findFirst({
        where: {
          OR: [
            { username: adminData.username },
            { email: adminData.email },
          ],
        },
      });

      if (!exists) {
        const role = await this.roleService.findByName(adminData.role);
        if (!role) {
          console.error(
            `${adminData.role} role not found. Skipping ${adminData.username}.`
          );
          continue;
        }

        const password = 'P@ssw0rd';
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.prisma.admin.create({
          data: {
            username: adminData.username,
            password: hashedPassword,
            email: adminData.email,
            role_id: role.id,
          },
        });
        console.log(
          `${adminData.username} user created with password: ${password}`
        );
      }
    }
  }
}
