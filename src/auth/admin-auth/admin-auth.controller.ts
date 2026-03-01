import {
  Body,
  Controller,
  Post,
  Get,
  Res,
  Req,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AdminAuthService } from './admin-auth.service';
import { LoginAdminSchema, ChangePasswordSchema, UnifiedLoginSchema } from '../dto/auth.dto';
import { JwtCookieGuard } from '../guards/jwt-cookie.guard';
import { RolesGuard } from '../guards/roles.guard';
import { JoiValidationPipe } from '../../pipes/joi-validation.pipe';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Admin-Auth')
@Controller('auth/admin')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) { }

  @Post('login')
  @ApiOperation({ summary: 'Admin Unified Login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { identifier: { type: 'string' }, password: { type: 'string' } }
    }
  })
  async login(
    @Body(new JoiValidationPipe(UnifiedLoginSchema)) dto: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const { identifier, password } = dto;
    const result = await this.authService.unifiedLogin(identifier, password);

    res.cookie('backend_token', result.token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      message: 'Login successful',
      userType: result.userType,
      role: result.role,
      status: 'success',
    };
  }

  @Post('legacy-login')
  @ApiOperation({ summary: 'Admin Legacy Login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string' }, password: { type: 'string' } }
    }
  })
  async legacyLogin(
    @Body(new JoiValidationPipe(LoginAdminSchema)) dto: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const { email, password } = dto;
    const result = await this.authService.login(email, password);

    res.cookie('backend_token', result.token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Login successful',
      status: 'success',
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Admin Logout' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('backend_token');
    return {
      message: 'Logout successful',
      status: 'success',
    };
  }

  @Post('change-password')
  @UseGuards(JwtCookieGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change Admin Password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string' } }
    }
  })
  async changePassword(
    @Body(new JoiValidationPipe(ChangePasswordSchema)) dto: any,
    @Req() req: Request
  ) {
    const { currentPassword, newPassword } = dto;
    const userId = (req as any).user.id;

    await this.authService.changePassword(userId, currentPassword, newPassword);

    return {
      message: 'Password updated successfully',
      status: 'success',
    };
  }

  @Get('me')
  @UseGuards(JwtCookieGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current Admin properties' })
  async getCurrentUser(@Req() req: Request) {
    const userId = (req as any).user.id;
    const userType = (req as any).user.userType;

    if (userType !== 'admin') {
      throw new UnauthorizedException('Not authorized to access the admin dashboard');
    }

    const result = await this.authService.getCurrentUser(userId, userType);

    return {
      ...result,
      status: 'success',
    };
  }
}
