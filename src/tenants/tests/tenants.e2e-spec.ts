import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../../app.module';
import { Tenant } from '../tenant.entity';
import { User } from '../../users/user.entity';
import { UserRole } from '../../users/user.entity';

describe('TenantsController (e2e)', () => {
  let app: INestApplication;
  let tenantRepository: Repository<Tenant>;
  let userRepository: Repository<User>;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forFeature([Tenant, User]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    tenantRepository = moduleFixture.get<Repository<Tenant>>(getRepositoryToken(Tenant));
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));

    await tenantRepository.delete({});
    await userRepository.delete({});

    await userRepository.save({
      username: 'admin',
      password: 'password',
      role: UserRole.ADMIN,
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'password' });
    adminToken = adminLogin.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /tenants', () => {
    it('should create a tenant (Admin)', () => {
      return request(app.getHttpServer())
        .post('/tenants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Tenant' })
        .expect(201)
        .then(response => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.name).toBe('Test Tenant');
        });
    });

    it('should forbid creating tenant without auth', () => {
      return request(app.getHttpServer())
        .post('/tenants')
        .send({ name: 'Test Tenant' })
        .expect(401);
    });

    it('should require name field', () => {
      return request(app.getHttpServer())
        .post('/tenants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('GET /tenants', () => {
    it('should get all tenants (Admin)', async () => {
      await tenantRepository.save({ name: 'Tenant 1' });
      await tenantRepository.save({ name: 'Tenant 2' });

      return request(app.getHttpServer())
        .get('/tenants')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then(response => {
          expect(Array.isArray(response.body)).toBeTruthy();
          expect(response.body.length).toBeGreaterThanOrEqual(2);
        });
    });

    it('should forbid access without admin role', async () => {
      await userRepository.save({
        username: 'user',
        password: 'password',
        role: UserRole.CUSTOMER,
      });

      const userLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'user', password: 'password' });
      const userToken = userLogin.body.access_token;

      return request(app.getHttpServer())
        .get('/tenants')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /tenants/:id', () => {
    it('should get a tenant by id (Admin)', async () => {
      const tenant = await tenantRepository.save({ name: 'Test Tenant' });

      return request(app.getHttpServer())
        .get(`/tenants/${tenant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then(response => {
          expect(response.body.id).toBe(tenant.id);
          expect(response.body.name).toBe('Test Tenant');
        });
    });

    it('should return 404 for non-existent tenant', () => {
      return request(app.getHttpServer())
        .get('/tenants/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});