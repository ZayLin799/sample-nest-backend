import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  async seedDefaultUsers() {
    const userCount = await this.prisma.user.count();
    if (userCount === 0) {
      await this.prisma.user.createMany({
        data: [
          { username: 'alice', email: 'alice@example.com', password: 'hashedpassword123' },
          { username: 'bob', email: 'bob@example.com', password: 'hashedpassword123' },
          { username: 'charlie', email: 'charlie@example.com', password: 'hashedpassword123' },
        ],
      });
      console.log('Seeded default users.');
    }
  }

  async findAll(reqUser: any, search?: string) {
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
      ];
    }

    return this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        email: true,
        isBanned: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: { username: true }
        },
        updatedBy: {
          select: { username: true }
        },
        bannedBy: {
          select: { username: true }
        }
      },
    });
  }

  async create(createData: any, adminId: string) {
    const hashedPassword = await bcrypt.hash(createData.password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        username: createData.username,
        email: createData.email,
        password: hashedPassword,
        createdById: adminId,
      },
    });
    const { password, ...result } = newUser;
    return result;
  }

  async update(id: string, updateData: any, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const dataToUpdate: any = { ...updateData, updatedById: adminId };

    if (dataToUpdate.password) {
      dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
    } else {
      delete dataToUpdate.password;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });
    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const deletedUser = await this.prisma.user.delete({
      where: { id },
    });
    const { password, ...result } = deletedUser;
    return result;
  }

  async banUser(id: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const isBanning = !user.isBanned;
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        isBanned: isBanning,
        bannedById: isBanning ? adminId : null
      },
    });
    const { password, ...result } = updatedUser;
    return result;
  }
}
