import { Controller, Get, Post, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/users/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateTenantDto } from 'src/tenants/dto/create-tenant.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Tenant } from './tenant.entity';

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)

export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) { }

    @Post()
    @Roles(UserRole.ADMIN)
     @ApiOperation({ summary: 'Create a new tenant' })
    @ApiBody({ type: CreateTenantDto })
    @ApiResponse({ 
        status: 201, 
        description: 'Tenant created successfully', 
        type: Tenant 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request (e.g., missing required fields)' 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden (requires admin role)' 
    })
    create(@Body() createTenantDto: CreateTenantDto) {
        return this.tenantsService.create(createTenantDto);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get all tenants' })
    @ApiResponse({ 
        status: 200, 
        description: 'List of all tenants', 
        type: [Tenant] 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden (requires admin role)' 
    })
    findAll() {
        return this.tenantsService.findAll();
    }
    @Get(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get a tenant by ID' })
    @ApiParam({ 
        name: 'id', 
        type: Number, 
        description: 'ID of the tenant to retrieve' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Tenant found', 
        type: Tenant 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized' 
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden (requires admin role)' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Tenant not found' 
    })
    findOne(@Param('id') id: number) {
        return this.tenantsService.findOne(id);
    }
}