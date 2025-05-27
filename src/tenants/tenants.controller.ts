import { Controller, Get, Post, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/users/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateTenantDto } from 'src/users/dto/create-tenant.dto';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)

export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() createTenantDto: CreateTenantDto) {
        return this.tenantsService.create(createTenantDto);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    findAll() {
        return this.tenantsService.findAll();
    }
    @Get(':id')
    @Roles(UserRole.ADMIN)
    findOne(@Param('id') id: number) {
        return this.tenantsService.findOne(id);
    }
}