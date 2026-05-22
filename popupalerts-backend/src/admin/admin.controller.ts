import { Controller, Get, UseGuards, Param, Body, Patch, ValidationPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from 'src/auth/admin.guard';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get('users')
    findAllUsers() {
        return this.adminService.findAllUsers();
    }

    // --- PERBAIKAN UTAMA DI SINI ---
    // Pastikan metode ini ada dan diketik dengan benar
    @Patch('users/:id/role')
    updateUserRole(
        @Param('id') id: string,
        @Body(new ValidationPipe()) updateUserRoleDto: UpdateUserRoleDto
    ) {
        return this.adminService.updateUserRole(id, updateUserRoleDto);
    }
    // -------------------------------

    @Get('subscriptions')
    findAllSubscriptions() {
        return this.adminService.findAllSubscriptions();
    }
    
    @Get('stats/total-users')
    getTotalUsers() {
        return this.adminService.getTotalUsers();
    }

    @Get('stats/total-subscriptions')
    getTotalActiveSubscriptions() {
        return this.adminService.getTotalActiveSubscriptions();
    }

    @Get('stats/total-widgets')
    getTotalWidgets() {
        return this.adminService.getTotalWidgets();
    }

    @Get('stats/total-leads')
    getTotalLeads() {
        return this.adminService.getTotalLeads();
    }
}

