import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleEnum } from '../../enum/role.enum';
import { Role } from '@prisma/client';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) { }

  async seedRoles() {
    const roles = Object.values(RoleEnum);
    for (const role of roles) {
      const exists = await this.prisma.role.findUnique({ where: { name: role } });
      if (!exists) {
        await this.prisma.role.create({ data: { name: role } });
        console.log(`Role ${role} created`);
      }
    }
  }

  async findByName(name: string): Promise<Role | null> {
    return this.prisma.role.findUnique({ where: { name } });
  }

  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' }
    });
  }
}
