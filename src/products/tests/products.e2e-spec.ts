import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product.entity';
import { User } from '../../users/user.entity';
import { UserRole } from '../../users/user.entity';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forFeature([Product, User]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const sellerRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'seller@example.com', password: 'password' });
    authToken = sellerRes.body.access_token;

    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'password' });
    adminToken = adminRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /products', () => {
    it('should create a product (201)', async () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 100,
          stock: 10,
        })
        .expect(201)
        .then(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test Product');
        });
    });

    it('should reject unauthorized (401)', async () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          price: 100,
        })
        .expect(401);
    });
  });

  describe('GET /products', () => {
    it('should return products (200)', async () => {
      return request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then(res => {
          expect(Array.isArray(res.body)).toBeTruthy();
        });
    });
  });

  describe('GET /products/:id', () => {
    it('should return product details (200)', async () => {
      const product = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Get Product',
          price: 50,
          stock: 5,
        });

      return request(app.getHttpServer())
        .get(`/products/${product.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then(res => {
          expect(res.body.id).toBe(product.body.id);
        });
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete product (200)', async () => {
      const product = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Delete Product',
          price: 75,
          stock: 3,
        });

      return request(app.getHttpServer())
        .delete(`/products/${product.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should forbid non-admin (403)', async () => {
      const product = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Forbidden Delete',
          price: 90,
          stock: 2,
        });

      return request(app.getHttpServer())
        .delete(`/products/${product.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });
});