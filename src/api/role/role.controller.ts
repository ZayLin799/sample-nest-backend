import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { JwtCookieGuard } from '../../auth/guards/jwt-cookie.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Role')
@ApiBearerAuth()
@UseGuards(JwtCookieGuard)
@Controller('role')
export class RoleController {
    constructor(private readonly roleService: RoleService) { }

    @Get()
    @ApiOperation({ summary: 'Get all roles' })
    findAll() {
        return this.roleService.findAll();
    }
}
