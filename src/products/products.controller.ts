import {
  Controller, Get, Post, Put, Delete, Body, Param,
  Query, UseGuards, BadRequestException, UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from '../users/dto/create-product.dto';
import { UpdateProductDto } from '../users/dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole, User } from 'src/users/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: User,
  ) {
    if (!user.tenantId) throw new BadRequestException('Tenant ID is required');
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10, @CurrentUser() user: User) {
    if (!user.tenantId) throw new BadRequestException('Tenant ID is required');
    return this.productsService.findAll(user.tenantId, Math.max(page, 1), Math.min(limit, 100));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  async findOne(@Param('id') id: number, @CurrentUser() user: User) {
    return this.productsService.findOne(id, user);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.productsService.update(id, updateProductDto, user, file);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: number, @CurrentUser() user: User) {
    return this.productsService.remove(id, user);
  }
}
