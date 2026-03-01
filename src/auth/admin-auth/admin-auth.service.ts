import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { generateToken } from '../../utils/auth.util';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) { }

  // ==================== UNIFIED LOGIN ====================

  async unifiedLogin(identifier: string, password: string) {
    const isEmail = identifier.includes('@');

    const user = await this.prisma.admin.findFirst({
      where: isEmail ? { email: identifier } : { username: identifier },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roleName = user.role?.name || '';

    if (roleName === 'user') {
      throw new UnauthorizedException('Users are not allowed to log into the admin dashboard.');
    }

    const tokenPayload: any = {
      id: user.id,
      userType: 'admin',
      role: roleName,
      email: user.email,
      username: user.username,
    };

    const token = generateToken(tokenPayload);

    return { token, userType: 'admin', role: roleName };
  }

  // ==================== LEGACY ADMIN LOGIN (For Backward Compatibility) ====================

  async login(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!admin) throw new UnauthorizedException('Email not found');

    const valid = await compare(password, admin.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const roleName = admin.role?.name || '';

    if (roleName === 'user') {
      throw new UnauthorizedException('Users are not allowed to log into the admin dashboard.');
    }

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      username: admin.username,
      userType: 'admin',
      role: roleName,
    });

    return { token };
  }

  // ==================== CHANGE PASSWORD ====================

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const admin = await this.prisma.admin.findUnique({ where: { id: userId } });
    if (!admin) throw new NotFoundException('User not found');

    const valid = await compare(currentPassword, admin.password);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const hashedPassword = await hash(newPassword, 10);
    await this.prisma.admin.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  // ==================== USER AUTHENTICATION ====================

  async registerUser(body: any) {
    const { username, email, password } = body;

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });
    if (existingUser) {
      throw new BadRequestException('User with username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return { message: 'User registered successfully' };
  }

  async loginUser(body: any) {
    const { identifier, password } = body;
    const isEmail = identifier.includes('@');

    const user = await this.prisma.user.findFirst({
      where: isEmail ? { email: identifier } : { username: identifier },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('User is banned');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokenPayload: any = {
      id: user.id,
      userType: 'user',
      role: 'user', // Basic role for users
      email: user.email,
      username: user.username,
    };

    const token = generateToken(tokenPayload);

    return { token, userType: 'user' };
  }

  // ==================== GET CURRENT USER ====================

  async getCurrentUser(userId: string, userType: string) {
    if (userType === 'admin') {
      const admin = await this.prisma.admin.findUnique({
        where: { id: userId },
        include: { role: { select: { name: true } } },
      });

      if (!admin) throw new NotFoundException('Admin not found');

      const { password, ...adminWithoutPassword } = admin;
      return {
        userType: 'admin',
        data: adminWithoutPassword,
      };
    } else if (userType === 'user') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) throw new NotFoundException('User not found');

      const { password, ...userWithoutPassword } = user;
      return {
        userType: 'user',
        data: userWithoutPassword,
      };
    } else {
      throw new UnauthorizedException('Invalid user type');
    }
  }
}
