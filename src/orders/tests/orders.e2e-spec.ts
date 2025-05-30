import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/user.entity';
import { Product } from '../../products/product.entity';
import { Order } from '../order.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let productRepository: Repository<Product>;
  let orderRepository: Repository<Order>;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    productRepository = moduleFixture.get<Repository<Product>>(getRepositoryToken(Product));
    orderRepository = moduleFixture.get<Repository<Order>>(getRepositoryToken(Order));

    await orderRepository.delete({});
    await productRepository.delete({});
    await userRepository.delete({});

    // Create user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'customer@example.com',
        password: 'password123',
        role: 'CUSTOMER',
        username: 'customer1',
      });

    // Login user
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'customer@example.com',
        password: 'password123',
      });

    jwtToken = loginResponse.body.access_token;

    // Create product
    await productRepository.save({
      name: 'Test Product',
      price: 50.0,
      stock: 10,
      description: 'Test description',
    });
  });

  it('POST /orders should create an order', async () => {
    const user = await userRepository.findOneBy({ email: 'customer@example.com' });
    const product = await productRepository.findOneBy({ name: 'Test Product' });

    if (!user) {
      throw new Error('User not found in userRepository');
    }
    if (!product) {
      throw new Error('Test Product not found in productRepository');
    }

    const res = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        userId: user.id,
        productId: product.id,
        quantity: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.quantity).toBe(2);
    expect(res.body.status).toBe('pending');
  });

  it('GET /orders/user/:userId should return user orders', async () => {
    const user = await userRepository.findOneBy({ email: 'customer@example.com' });

    if (!user) {
      throw new Error('User not found in userRepository');
    }

    const res = await request(app.getHttpServer())
      .get(`/orders/user/${user.id}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('PATCH /orders/:id/status should update order status', async () => {
    const order = await orderRepository.findOne({ relations: ['user'] });

    if (!order) {
      throw new Error('Order not found in orderRepository');
    }

    const res = await request(app.getHttpServer())
      .patch(`/orders/${order.id}/status`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ status: 'shipped' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('shipped');
  });

  it('POST /orders/:id/pay should mark order as paid', async () => {
    const order = await orderRepository.findOne({ relations: ['user'] });

    if (!order) {
      throw new Error('Order not found in orderRepository');
    }

    const res = await request(app.getHttpServer())
      .post(`/orders/${order.id}/pay`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('paid');
  });

  afterAll(async () => {
    await app.close();
  });
});
