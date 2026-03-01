import { Controller, Get, Post, Put, Delete, Patch, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtCookieGuard } from '../../auth/guards/jwt-cookie.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleEnum } from '../../enum/role.enum';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JoiValidationPipe } from '../../pipes/joi-validation.pipe';
import { RegisterUserSchema, UpdateUserSchema } from './user.schema';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtCookieGuard, RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Roles(RoleEnum.ROOT, RoleEnum.DEVELOPER, RoleEnum.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async findAll(@Req() req: any, @Query('search') search?: string) {
    return this.userService.findAll(req.user, search);
  }

  @Roles(RoleEnum.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  async create(
    @Body(new JoiValidationPipe(RegisterUserSchema)) createData: any,
    @Req() req: any
  ) {
    return this.userService.create(createData, req.user.id);
  }

  @Roles(RoleEnum.ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Update a user (Admin only)' })
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(UpdateUserSchema)) updateData: any,
    @Req() req: any
  ) {
    return this.userService.update(id, updateData, req.user.id);
  }

  @Roles(RoleEnum.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.userService.remove(id, req.user.id);
  }

  @Roles(RoleEnum.ADMIN)
  @Patch(':id/ban')
  @ApiOperation({ summary: 'Ban or Unban a user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async banUser(@Param('id') id: string, @Req() req: any) {
    return this.userService.banUser(id, req.user.id);
  }
}
