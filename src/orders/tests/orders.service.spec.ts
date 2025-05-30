import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './../orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './../order.entity';
import { User } from '../../users/user.entity';
import { Product } from '../../products/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('OrdersService', () => {
    let service: OrdersService;
    let orderRepo: Repository<Order>;
    let userRepo: Repository<User>;
    let productRepo: Repository<Product>;

    const mockOrderRepo = {
        create: jest.fn(),
        save: jest.fn(),
        findOneBy: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
    };

    const mockUserRepo = {
        findOneBy: jest.fn(),
    };

    const mockProductRepo = {
        findOneBy: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrdersService,
                { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
                { provide: getRepositoryToken(User), useValue: mockUserRepo },
                { provide: getRepositoryToken(Product), useValue: mockProductRepo },
            ],
        }).compile();

        service = module.get<OrdersService>(OrdersService);
        orderRepo = module.get(getRepositoryToken(Order));
        userRepo = module.get(getRepositoryToken(User));
        productRepo = module.get(getRepositoryToken(Product));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createOrder', () => {
        it('should create an order successfully', async () => {
            const user = { id: 1 } as User;
            const product = { id: 2, price: 100 } as Product;
            const order = { id: 1, quantity: 2, totalPrice: 200, status: 'pending' } as Order;

            mockUserRepo.findOneBy.mockResolvedValue(user);
            mockProductRepo.findOneBy.mockResolvedValue(product);
            mockOrderRepo.create.mockReturnValue(order);
            mockOrderRepo.save.mockResolvedValue(order);

            const result = await service.createOrder(1, 2, 2);
            expect(result).toEqual(order);
            expect(mockOrderRepo.create).toHaveBeenCalledWith({
                user,
                product,
                quantity: 2,
                totalPrice: 200,
                status: 'pending',
            });
        });

        it('should throw NotFoundException if user not found', async () => {
            mockUserRepo.findOneBy.mockResolvedValue(null);
            await expect(service.createOrder(1, 2, 2)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if product not found', async () => {
            mockUserRepo.findOneBy.mockResolvedValue({ id: 1 });
            mockProductRepo.findOneBy.mockResolvedValue(null);
            await expect(service.createOrder(1, 2, 2)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getOrdersByUser', () => {
        it('should return orders for a user', async () => {
            const orders = [{ id: 1 }, { id: 2 }] as Order[];
            mockOrderRepo.find.mockResolvedValue(orders);
            const result = await service.getOrdersByUser(1);
            expect(result).toEqual(orders);
            expect(mockOrderRepo.find).toHaveBeenCalledWith({
                where: { user: { id: 1 } },
                relations: ['product'],
            });
        });
    });

    describe('updateStatus', () => {
        it('should update the status of an order', async () => {
            const order = { id: 1, status: 'pending' } as Order;
            mockOrderRepo.findOneBy.mockResolvedValue(order);
            mockOrderRepo.save.mockResolvedValue({ ...order, status: 'shipped' });

            const result = await service.updateStatus(1, 'shipped');
            expect(result.status).toBe('shipped');
        });

        it('should throw NotFoundException if order not found', async () => {
            mockOrderRepo.findOneBy.mockResolvedValue(null);
            await expect(service.updateStatus(1, 'shipped')).rejects.toThrow(NotFoundException);
        });
    });

    describe('payOrder', () => {
        it('should mark order as paid if status is pending', async () => {
            const order = { id: 1, status: 'pending' } as Order;
            mockOrderRepo.findOne.mockResolvedValue(order);
            mockOrderRepo.save.mockResolvedValue({ ...order, status: 'paid' });

            const result = await service.payOrder(1);
            if ('status' in result) {
                expect(result.status).toBe('paid');
            } else {
                fail('Expected result to have a status property');
            }
        });

        it('should return message if order is already paid', async () => {
            const order = { id: 1, status: 'paid' } as Order;
            mockOrderRepo.findOne.mockResolvedValue(order);

            const result = await service.payOrder(1);
            expect(result).toEqual({ message: 'Order already paid or not eligible' });
        });

        it('should throw NotFoundException if order not found', async () => {
            mockOrderRepo.findOne.mockResolvedValue(null);
            await expect(service.payOrder(1)).rejects.toThrow(NotFoundException);
        });
    });
});
