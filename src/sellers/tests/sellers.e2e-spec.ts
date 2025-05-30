import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../../app.module';
import { Seller } from '../../sellers/seller.entity';
import { User } from '../../users/user.entity';
import { UserRole } from '../../users/user.entity';
import { Tenant } from '../../tenants/tenant.entity';

describe('SellersController (e2e)', () => {
  let app: INestApplication;
  let sellerRepository: Repository<Seller>;
  let userRepository: Repository<User>;
  let tenantRepository: Repository<Tenant>;
  let adminToken: string;
  let sellerToken: string;
  let testTenant: Tenant;
  let adminUser: User;
  let sellerUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forFeature([Seller, User, Tenant]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    sellerRepository = moduleFixture.get<Repository<Seller>>(getRepositoryToken(Seller));
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    tenantRepository = moduleFixture.get<Repository<Tenant>>(getRepositoryToken(Tenant));

    await sellerRepository.delete({});
    await userRepository.delete({});
    await tenantRepository.delete({});

    testTenant = await tenantRepository.save({ name: 'Test Tenant' });

    adminUser = await userRepository.save({
      username: 'admin',
      password: 'password',
      role: UserRole.ADMIN,
      tenantId: testTenant.id,
    });

    sellerUser = await userRepository.save({
      username: 'seller',
      password: 'password',
      role: UserRole.SELLER,
      tenantId: testTenant.id,
    });

    await sellerRepository.save({
      name: 'Test Seller',
      user: sellerUser,
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'password' });
    adminToken = adminLogin.body.access_token;

    const sellerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'seller', password: 'password' });
    sellerToken = sellerLogin.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /sellers', () => {
    it('should create a seller', async () => {
      const newUser = await userRepository.save({
        username: 'new-seller',
        password: 'password',
        role: UserRole.SELLER,
        tenantId: testTenant.id,
      });

      return request(app.getHttpServer())
        .post('/sellers')
        .send({ name: 'New Seller', userId: newUser.id })
        .expect(201)
        .then(response => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.name).toBe('New Seller');
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/sellers')
        .send({ name: 'New Seller', userId: 1 })
        .expect(401);
    });
  });

  describe('GET /sellers/mine', () => {
    it('should return seller data for seller user', () => {
      return request(app.getHttpServer())
        .get('/sellers/mine')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200)
        .then(response => {
          expect(response.body).toBeDefined();
          expect(response.body.user.username).toBe('seller');
        });
    });

    it('should return all sellers for admin user', async () => {
      return request(app.getHttpServer())
        .get('/sellers/mine')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then(response => {
          expect(Array.isArray(response.body)).toBeTruthy();
          expect(response.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /sellers', () => {
    it('should return all sellers for admin', () => {
      return request(app.getHttpServer())
        .get('/sellers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then(response => {
          expect(Array.isArray(response.body)).toBeTruthy();
        });
    });

    it('should return seller data for seller', () => {
      return request(app.getHttpServer())
        .get('/sellers')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200)
        .then(response => {
          expect(response.body).toBeDefined();
          expect(response.body.user.username).toBe('seller');
        });
    });
  });

  describe('GET /sellers/:id', () => {
    it('should return seller by id for admin', async () => {
      const seller = await sellerRepository.findOne({ where: { user: { id: sellerUser.id } } });
      if (!seller) {
        throw new Error('Seller not found');
      }

      return request(app.getHttpServer())
        .get(`/sellers/${seller.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then(response => {
          expect(response.body.id).toBe(seller.id);
        });
    });

    it('should return seller by id for owner', async () => {
      const seller = await sellerRepository.findOne({ where: { user: { id: sellerUser.id } } });
      if (!seller) {
        throw new Error('Seller not found');
      }

      return request(app.getHttpServer())
        .get(`/sellers/${seller.id}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200)
        .then(response => {
          expect(response.body.id).toBe(seller.id);
        });
    });

    it('should forbid access for non-owner seller', async () => {
      const newSellerUser = await userRepository.save({
        username: 'another-seller',
        password: 'password',
        role: UserRole.SELLER,
        tenantId: testTenant.id,
      });
      const newSeller = await sellerRepository.save({
        name: 'Another Seller',
        user: newSellerUser,
      });

      return request(app.getHttpServer())
        .get(`/sellers/${newSeller.id}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);
    });
  });

  describe('PUT /sellers/:id', () => {
    it('should update seller for admin', async () => {
      const seller = await sellerRepository.findOne({ where: { user: { id: sellerUser.id } } });
      if (!seller) {
        throw new Error('Seller not found');
      }

      return request(app.getHttpServer())
        .put(`/sellers/${seller.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(200)
        .then(response => {
          expect(response.body.name).toBe('Updated Name');
        });
    });

    it('should forbid update for non-owner seller', async () => {
      const newSellerUser = await userRepository.save({
        username: 'another-seller-2',
        password: 'password',
        role: UserRole.SELLER,
        tenantId: testTenant.id,
      });
      const newSeller = await sellerRepository.save({
        name: 'Another Seller 2',
        user: newSellerUser,
      });

      return request(app.getHttpServer())
        .put(`/sellers/${newSeller.id}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ name: 'Updated Name' })
        .expect(403);
    });
  });

  describe('DELETE /sellers/:id', () => {
    it('should delete seller for admin', async () => {
      const newSellerUser = await userRepository.save({
        username: 'seller-to-delete',
        password: 'password',
        role: UserRole.SELLER,
        tenantId: testTenant.id,
      });
      const newSeller = await sellerRepository.save({
        name: 'Seller to Delete',
        user: newSellerUser,
      });

      return request(app.getHttpServer())
        .delete(`/sellers/${newSeller.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should forbid delete for seller', async () => {
      const seller = await sellerRepository.findOne({ where: { user: { id: sellerUser.id } } });
      if (!seller) {
        throw new Error('Seller not found');
      }

      return request(app.getHttpServer())
        .delete(`/sellers/${seller.id}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);
    });
  });
});