import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { UserRole } from '../user.entity';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users/profile-seller (GET)', () => {
    it('should return 401 if no token provided', () => {
      return request(app.getHttpServer())
        .get('/users/profile-seller')
        .expect(401);
    });

    it('should return 403 if user is not a seller', async () => {
      return request(app.getHttpServer())
        .get('/users/profile-seller')
        .set('Authorization', 'Bearer invalid-role-token')
        .expect(403);
    });
  });
});