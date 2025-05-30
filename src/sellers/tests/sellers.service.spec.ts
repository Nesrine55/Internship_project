import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellersService } from '../sellers.service';
import { Seller } from '../seller.entity';
import { UsersService } from '../../users/users.service';
import { NotFoundException } from '@nestjs/common';
import { CreateSellerDto } from '../dto/create-seller.dto';
import { UpdateSellerDto } from '../dto/update-seller.dto';
import { User } from '../../users/user.entity';

describe('SellersService', () => {
    let service: SellersService;
    let sellerRepository: Repository<Seller>;
    let usersService: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SellersService,
                {
                    provide: getRepositoryToken(Seller),
                    useClass: Repository,
                },
                {
                    provide: UsersService,
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<SellersService>(SellersService);
        sellerRepository = module.get<Repository<Seller>>(getRepositoryToken(Seller));
        usersService = module.get<UsersService>(UsersService);
    });

    describe('create', () => {
        it('should create a seller successfully', async () => {
            const createSellerDto: CreateSellerDto = { name: 'Test Seller', userId: 1 };
            const mockUser = { id: 1 } as User;
            const mockSeller = { id: 1, ...createSellerDto, user: mockUser, products: [], } as Seller;

            jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(sellerRepository, 'create').mockReturnValue(mockSeller);
            jest.spyOn(sellerRepository, 'save').mockResolvedValue(mockSeller);

            const result = await service.create(createSellerDto);
            expect(result).toEqual(mockSeller);
            expect(usersService.findOne).toHaveBeenCalledWith(createSellerDto.userId);
        });

        it('should throw NotFoundException if user not found', async () => {
            const createSellerDto: CreateSellerDto = { name: 'Test Seller', userId: 1 };
            jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

            await expect(service.create(createSellerDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return an array of sellers', async () => {
            const mockSellers = [
                { id: 1, name: 'Seller 1' },
                { id: 2, name: 'Seller 2' },
            ] as Seller[];

            jest.spyOn(sellerRepository, 'find').mockResolvedValue(mockSellers);

            const result = await service.findAll();
            expect(result).toEqual(mockSellers);
        });
    });

    describe('findOne', () => {
        it('should return a seller by id', async () => {
            const mockSeller = { id: 1, name: 'Test Seller' } as Seller;
            jest.spyOn(sellerRepository, 'findOne').mockResolvedValue(mockSeller);

            const result = await service.findOne(1);
            expect(result).toEqual(mockSeller);
        });

        it('should throw NotFoundException if seller not found', async () => {
            jest.spyOn(sellerRepository, 'findOne').mockResolvedValue(null);
            await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a seller', async () => {
            const mockSeller = { id: 1, name: 'Old Name', user: { id: 1 } } as Seller;
            const updateSellerDto: UpdateSellerDto = { name: 'New Name' };
            const updatedSeller = { ...mockSeller, name: 'New Name' } as Seller;

            jest.spyOn(service, 'findOne').mockResolvedValue(mockSeller);
            jest.spyOn(sellerRepository, 'save').mockResolvedValue(updatedSeller);

            const result = await service.update(1, updateSellerDto);
            expect(result.name).toBe('New Name');
        });

        it('should update user if userId provided', async () => {
            const mockSeller = { id: 1, name: 'Test', user: { id: 1 } } as Seller;
            const newUser = { id: 2 } as User;
            const updateSellerDto: UpdateSellerDto = { userId: 2 };

            jest.spyOn(service, 'findOne').mockResolvedValue(mockSeller);
            jest.spyOn(usersService, 'findOne').mockResolvedValue(newUser);
            jest.spyOn(sellerRepository, 'save').mockImplementation(async (seller) => seller as Seller);

            const result = await service.update(1, updateSellerDto);
            expect(result.user.id).toBe(2);
        });
    });

    describe('remove', () => {
        it('should remove a seller', async () => {
            const mockSeller = { id: 1, name: 'Test Seller' } as Seller;
            jest.spyOn(service, 'findOne').mockResolvedValue(mockSeller);
            jest.spyOn(sellerRepository, 'remove').mockResolvedValue(mockSeller);

            await service.remove(1);
            expect(sellerRepository.remove).toHaveBeenCalledWith(mockSeller);
        });
    });

    describe('findAllByTenant', () => {
        it('should return sellers by tenant', async () => {
            const mockSellers = [{ id: 1, name: 'Seller 1' }] as Seller[];
            jest.spyOn(sellerRepository, 'find').mockResolvedValue(mockSellers);

            const result = await service.findAllByTenant(1);
            expect(result).toEqual(mockSellers);
        });
    });

    describe('findOneByUserId', () => {
        it('should return seller by user id', async () => {
            const mockSeller = { id: 1, name: 'Test Seller' } as Seller;
            jest.spyOn(sellerRepository, 'findOne').mockResolvedValue(mockSeller);

            const result = await service.findOneByUserId(1);
            expect(result).toEqual(mockSeller);
        });
    });
});