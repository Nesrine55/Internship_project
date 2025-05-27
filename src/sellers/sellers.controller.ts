import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { CreateSellerDto } from '../users/dto/create-seller.dto';
import { UpdateSellerDto } from '../users/dto/update-seller.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { User, UserRole } from 'src/users/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';


@Controller('sellers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SellersController {
    constructor(private readonly sellersService: SellersService) { }

    @Post()
    create(@Body() createSellerDto: CreateSellerDto) {
        return this.sellersService.create(createSellerDto);
    }
    @Get('mine')
    @Roles(UserRole.SELLER, UserRole.ADMIN)
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
