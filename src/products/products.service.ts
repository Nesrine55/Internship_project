import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { S3Service } from 'src/aws/s3.service';
import { User } from 'src/users/user.entity';
import { CreateProductDto } from 'src/users/dto/create-product.dto';
import { UpdateProductDto } from 'src/users/dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    user: User,
  ): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      tenant: { id: user.tenantId },
      seller: { id: user.id },
    });

    return this.productRepository.save(product);
  }

  async findAll(
    tenantId: number,
    page: number,
    limit: number,
  ): Promise<{ data: Product[]; total: number }> {
    const [data, total] = await this.productRepository.findAndCount({
      where: { tenant: { id: tenantId } },
      relations: ['tenant', 'seller'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findOne(id: number, user: User): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, tenant: { id: user.tenantId } },
      relations: ['tenant', 'seller'],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async update(
    id: number,
    updateData: UpdateProductDto,
    user: User,
    imageFile?: Express.Multer.File,
  ): Promise<Product> {
    const product = await this.findOne(id, user);

    if (imageFile) {
      const imageUrl = await this.s3Service.uploadFile(imageFile, 'products');
      updateData.imageUrl = imageUrl;
    }

    Object.assign(product, updateData);
    return this.productRepository.save(product);
  }

  async remove(id: number, user: User): Promise<Product> {
    const product = await this.findOne(id, user);
    return this.productRepository.remove(product);
  }
}
