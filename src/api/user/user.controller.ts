import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtCookieGuard } from '../../auth/guards/jwt-cookie.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(JwtCookieGuard, RolesGuard)
  @Roles('root')
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtCookieGuard, RolesGuard)
  @Roles('root')
  @Patch(':id/ban')
  @ApiOperation({ summary: 'Ban a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async banUser(@Param('id') id: string) {
    return this.userService.banUser(id);
  }
}
