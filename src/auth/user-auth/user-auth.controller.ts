import {
  Body,
  Controller,
  Post,
  Get,
  Res,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { UserAuthService } from './user-auth.service';
import { RegisterUserSchema, LoginUserSchema } from '../../api/user/user.schema';
import { JwtCookieGuard } from '../guards/jwt-cookie.guard';
import { UserStatusGuard } from '../guards/user-status.guard';
import { JoiValidationPipe } from '../../pipes/joi-validation.pipe';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('User-Auth')
@Controller('auth/user')
export class UserAuthController {
  constructor(private readonly authService: UserAuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new User' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { username: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' } }
    }
  })
  async registerUser(
    @Body(new JoiValidationPipe(RegisterUserSchema)) dto: any
  ) {
    return this.authService.registerUser(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { identifier: { type: 'string' }, password: { type: 'string' } }
    }
  })
  async loginUser(
    @Body(new JoiValidationPipe(LoginUserSchema)) dto: any,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.loginUser(dto);

    res.cookie('backend_token', result.token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Login successful',
      userType: result.userType,
      status: 'success',
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'User Logout' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('backend_token');
    return {
      message: 'Logout successful',
      status: 'success',
    };
  }

  @Get('me')
  @UseGuards(JwtCookieGuard, UserStatusGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current User profile' })
  async getCurrentUser(@Req() req: Request) {
    const userId = (req as any).user.id;
    const userType = (req as any).user.userType;

    const result = await this.authService.getCurrentUser(userId, userType);

    return {
      ...result,
      status: 'success',
    };
  }
}
