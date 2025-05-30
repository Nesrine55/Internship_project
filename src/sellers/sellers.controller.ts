import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { User, UserRole } from 'src/users/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Seller } from './seller.entity';

@ApiTags('sellers')
@ApiBearerAuth()
@Controller('sellers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SellersController {
    constructor(private readonly sellersService: SellersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new seller' })
    @ApiBody({ type: CreateSellerDto })
    @ApiResponse({
        status: 201,
        description: 'Seller created successfully',
        type: Seller
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request'
    })
    @ApiResponse({
        status: 404,
        description: 'User not found'
    })
    create(@Body() createSellerDto: CreateSellerDto) {
        return this.sellersService.create(createSellerDto);
    }
    @Get('mine')
    @Roles(UserRole.SELLER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get current user seller data (for sellers) or all sellers (for admin)' })
    @ApiResponse({
        status: 200,
        description: 'Seller data',
        type: [Seller]
    })
    @ApiResponse({
        status: 400,
        description: 'Tenant ID is required'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden'
    })
    async findSellersByUser(@CurrentUser() user: User) {
        if (!user.tenantId) {
            throw new BadRequestException('Tenant ID is required');
        }

        if (user.role === UserRole.ADMIN) {
            return this.sellersService.findAllByTenant(user.tenantId);
        } else {
            return this.sellersService.findOneByUserId(user.id);
        }
    }
    @Get()
    @Roles(UserRole.ADMIN, UserRole.SELLER)
    @ApiOperation({ summary: 'Get all sellers (admin) or current seller (seller)' })
    @ApiResponse({
        status: 200,
        description: 'List of sellers or single seller',
        type: [Seller]
    })
    @ApiResponse({
        status: 400,
        description: 'Tenant ID is required'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden'
    })
    async findAll(@CurrentUser() user: User) {
        if (!user.tenantId) {
            throw new BadRequestException('Tenant ID is required');
        }

        if (user.role === UserRole.ADMIN) {
            console.log('CurrentUser tenantId:', user.tenantId);

            return this.sellersService.findAllByTenant(user.tenantId);
        } else {
            return this.sellersService.findOneByUserId(user.id);
        }
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.SELLER)
    @ApiOperation({ summary: 'Get seller by ID' })
    @ApiParam({ name: 'id', type: Number, description: 'Seller ID' })
    @ApiResponse({
        status: 200,
        description: 'Seller found',
        type: Seller
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden'
    })
    @ApiResponse({
        status: 404,
        description: 'Seller not found'
    })
    async findOne(@Param('id') id: number, @CurrentUser() user: User) {
        const seller = await this.sellersService.findOne(id);

        if (!seller) {
            throw new NotFoundException('Seller not found');
        }

        if (user.role === UserRole.SELLER && seller.user.id !== user.id) {
            throw new ForbiddenException('Access denied');
        }
        if (user.role === UserRole.ADMIN && seller.user.tenantId !== user.tenantId) {
            throw new ForbiddenException('Access denied');
        }

        return seller;
    }




    @Put(':id')
    @Roles(UserRole.ADMIN, UserRole.SELLER)
    async update(
        @Param('id') id: number,
        @Body() updateSellerDto: UpdateSellerDto,
        @CurrentUser() user: User,
    ) {
        const seller = await this.sellersService.findOne(id);

        if (!seller) {
            throw new NotFoundException('Seller not found');
        }

        if (user.role === UserRole.SELLER && seller.user.id !== user.id) {
            throw new ForbiddenException('Access denied');
        }
        if (user.role === UserRole.ADMIN && seller.user.tenantId !== user.tenantId) {
            throw new ForbiddenException('Access denied');
        }

        return this.sellersService.update(id, updateSellerDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async remove(@Param('id') id: number, @CurrentUser() user: User) {
        const seller = await this.sellersService.findOne(id);

        if (!seller) {
            throw new NotFoundException('Seller not found');
        }
        if (seller.user.tenantId !== user.tenantId) {
            throw new ForbiddenException('Access denied');
        }

        return this.sellersService.remove(id);
    }
}
