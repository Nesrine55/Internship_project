import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../product.entity';
import { ProductsService } from '../products.service';
import { Repository } from 'typeorm';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { User, UserRole } from '../../users/user.entity';
import { S3Service } from '../../aws/s3.service';
import { NotFoundException } from '@nestjs/common';
import { Express } from 'express';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: jest.Mocked<Repository<Product>>;
  let s3Service: jest.Mocked<S3Service>;

  const mockUser: User = {
    id: 1,
    email: 'seller@example.com',
    role: UserRole.SELLER,
    tenantId: 1,
  } as User;

  const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    stock: 10,
    imageUrl: 'http://example.com/image.jpg',
    tenant: { id: 1 } as any,
    seller: { id: 1 } as any,
    orders: [],
  };

  const mockFile = {
    originalname: 'test.jpg',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test'),
    size: 1024,
  } as Express.Multer.File;

  beforeEach(async () => {
    const s3ServiceMock = {
      uploadFile: jest.fn().mockResolvedValue('http://example.com/new-image.jpg'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
            findOne: jest.fn(),
            remove: jest.fn().mockResolvedValue(mockProduct),
          },
        },
        {
          provide: S3Service,
          useValue: s3ServiceMock,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get(getRepositoryToken(Product));
    s3Service = module.get(S3Service);
  });

  describe('create', () => {
    it('should successfully create a product', async () => {
      const createDto: CreateProductDto = {
        name: 'New Product',
        description: 'Description',
        price: 100,
        stock: 10,
      };

      productRepository.create.mockReturnValue(mockProduct);
      productRepository.save.mockResolvedValue(mockProduct);

      const result = await service.create(createDto, mockUser);

      expect(productRepository.create).toHaveBeenCalledWith({
        ...createDto,
        tenant: { id: mockUser.tenantId },
        seller: { id: mockUser.id },
      });
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return an array of products with pagination data', async () => {
      const result = await service.findAll(mockUser.tenantId ?? 1, 1, 10);

      expect(result).toEqual({
        data: [mockProduct],
        total: 1,
      });
      expect(productRepository.findAndCount).toHaveBeenCalledWith({
        where: { tenant: { id: mockUser.tenantId } },
        relations: ['tenant', 'seller'],
        skip: 0,
        take: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      productRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne(1, mockUser);

      expect(result).toEqual(mockProduct);
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, tenant: { id: mockUser.tenantId } },
        relations: ['tenant', 'seller'],
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      productRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product without image', async () => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Name',
        price: 200,
      };

      const updatedProduct = {
        ...mockProduct,
        ...updateDto,
      };

      productRepository.findOne.mockResolvedValueOnce(mockProduct);
      productRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.update(1, updateDto, mockUser, undefined);

      expect(result).toEqual(updatedProduct);
      expect(s3Service.uploadFile).not.toHaveBeenCalled();
    });

    it('should update a product with image', async () => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Name',
      };

      const updatedProduct = {
        ...mockProduct,
        ...updateDto,
        imageUrl: 'http://example.com/new-image.jpg',
      };

      productRepository.findOne.mockResolvedValueOnce(mockProduct);
      productRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.update(1, updateDto, mockUser, mockFile);

      expect(result).toEqual(updatedProduct);
      expect(s3Service.uploadFile).toHaveBeenCalledWith(mockFile, 'products');
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      productRepository.findOne.mockResolvedValue(mockProduct);
      const result = await service.remove(1, mockUser);

      expect(result).toEqual(mockProduct);
      expect(productRepository.remove).toHaveBeenCalledWith(mockProduct);
    });
  });
});