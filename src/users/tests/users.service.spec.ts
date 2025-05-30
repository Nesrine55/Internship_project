import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../user.entity';
import { UsersService } from '../users.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((password) => {
    console.log('BCrypt hash called with:', password);
    return Promise.resolve(`hashed_${password}`);
  }),
  compare: jest.fn().mockImplementation((plain, hashed) => {
    console.log('BCrypt compare called with:', plain, hashed); 
    return Promise.resolve(`hashed_${plain}` === hashed);
  }),
}));
describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashed_password123',
    role: UserRole.CUSTOMER,
    tenant: undefined,
    orders: [],
    tenantId: undefined,
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    password: 'password123',
    role: UserRole.CUSTOMER,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn().mockImplementation((dto) => ({
              ...dto,
              id: mockUser.id,
              orders: [],
              tenant: null,
            })),
            save: jest.fn().mockImplementation(user => Promise.resolve(user)),
            findOne: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  /*it('should be defined', () => {
    expect(service).toBeDefined();
  });*/

  describe('create()', () => {
    it('should successfully create a user', async () => {
      const result = await service.create(mockCreateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);

      expect(userRepository.create).toHaveBeenCalledWith({
        ...mockCreateUserDto,
        password: 'hashed_password123',
      });
      expect(result).toEqual({
        ...mockCreateUserDto,
        password: 'hashed_password123',
        id: mockUser.id,
        orders: [],
        tenant: null,
      });
    });

    it('should throw an error if creation fails', async () => {
      userRepository.save.mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.create(mockCreateUserDto)).rejects.toThrow('DB Error');
      expect(bcrypt.hash).toHaveBeenCalled();
    });
  });

  describe('findByEmail()', () => {
    it('should find user by email with password', async () => {
      const result = await service.findByEmail(mockUser.email, true);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
        relations: ['tenant'],
        select: ['id', 'email', 'password', 'role', 'tenantId'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should find user by email without password', async () => {
      const result = await service.findByEmail(mockUser.email, false);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
        relations: ['tenant'],
        select: ['id', 'email', 'role', 'tenantId'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      userRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.findByEmail('nonexistent@test.com');
      expect(result).toBeNull();
    });
  });

  describe('validateUser()', () => {
    it('should validate user with correct credentials', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValueOnce({
        ...mockUser,
        password: 'hashed_password123',
      });

      const result = await service.validateUser(mockUser.email, 'password123');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        tenant: undefined,
        orders: [],
        tenantId: undefined,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password123');
    });


    it('should return null for invalid password', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValueOnce({
        ...mockUser,
        password: 'hashed_password123',
      });

      const result = await service.validateUser(mockUser.email, 'wrongpassword');
      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashed_password123');
    });

    it('should return null for non-existent user', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValueOnce(null);

      const result = await service.validateUser('nonexistent@test.com', 'password');
      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('should find user by id', async () => {
      const result = await service.findOne(mockUser.id);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: ['id', 'email', 'role'],
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById()', () => {
    it('should find user by id with tenant relation', async () => {
      const result = await service.findById(mockUser.id);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        relations: ['tenant'],
      });
      expect(result).toEqual(mockUser);
    });
  });
});