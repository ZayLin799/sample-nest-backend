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

  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      role: {
        name: RoleEnum.ADMIN
      }
    };

    if (query.search) {
      whereClause.OR = [
        { username: { contains: query.search } },
        { email: { contains: query.search } },
      ];
    }

    const [admins, total] = await Promise.all([
      this.prisma.admin.findMany({
        where: whereClause,
        skip,
        take: Number(limit),
        include: {
          role: true,
          createdBy: { select: { username: true } }
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.admin.count({ where: whereClause }),
    ]);

    // Omit passwords
    const data = admins.map(admin => {
      const { password, ...rest } = admin;
      return rest;
    });

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  async create(createData: any, createdById?: string) {
    let roleId = createData.role_id;
    if (!roleId) {
      const role = await this.roleService.findByName(RoleEnum.ADMIN);
      if (role) {
        roleId = role.id;
      }
    }

    const hashedPassword = await bcrypt.hash(createData.password, 10);
    const newAdmin = await this.prisma.admin.create({
      data: {
        username: createData.username,
        email: createData.email,
        password: hashedPassword,
        role_id: roleId,
        createdById: createdById,
      },
    });
    const { password, ...result } = newAdmin;
    return result;
  }

  async update(id: string, updateData: any) {
    const dataToUpdate: any = { ...updateData };

    if (dataToUpdate.password) {
      dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
    } else {
      delete dataToUpdate.password;
    }

    const updatedAdmin = await this.prisma.admin.update({
      where: { id },
      data: dataToUpdate,
    });
    const { password, ...result } = updatedAdmin;
    return result;
  }

  async remove(id: string) {
    const deletedAdmin = await this.prisma.admin.delete({
      where: { id },
    });
    const { password, ...result } = deletedAdmin;
    return result;
  }

  async banAdmin(id: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) {
      throw new Error('Admin not found');
    }
    const updatedAdmin = await this.prisma.admin.update({
      where: { id },
      data: { isBanned: !admin.isBanned },
    });
    const { password, ...result } = updatedAdmin;
    return result;
  }
}
