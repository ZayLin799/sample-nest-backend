import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    Patch,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminSchema, UpdateAdminSchema } from './admin.schema';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { JwtCookieGuard } from '../../auth/guards/jwt-cookie.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleEnum } from '../../enum/role.enum';
import { JoiValidationPipe } from '../../pipes/joi-validation.pipe';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtCookieGuard, RolesGuard)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Roles(RoleEnum.ROOT, RoleEnum.DEVELOPER)
    @Get()
    @ApiOperation({ summary: 'Get all admins (Root and Developer only)' })
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
    ) {
        return this.adminService.findAll({ page, limit, search });
    }

    @Roles(RoleEnum.ROOT)
    @Post()
    @ApiOperation({ summary: 'Create a new admin (Root only)' })
    create(
        @Body(new JoiValidationPipe(CreateAdminSchema)) createData: any,
        @Req() req: any
    ) {
        return this.adminService.create(createData, req.user?.id);
    }

    @Roles(RoleEnum.ROOT)
    @Put(':id')
    @ApiOperation({ summary: 'Update an admin (Root only)' })
    update(
        @Param('id') id: string,
        @Body(new JoiValidationPipe(UpdateAdminSchema)) updateData: any,
    ) {
        return this.adminService.update(id, updateData);
    }

    @Roles(RoleEnum.ROOT)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete an admin (Root only)' })
    remove(@Param('id') id: string) {
        return this.adminService.remove(id);
    }

    @Roles(RoleEnum.ROOT)
    @Patch(':id/ban')
    @ApiOperation({ summary: 'Ban or unban an admin (Root only)' })
    ban(@Param('id') id: string) {
        return this.adminService.banAdmin(id);
    }
}
