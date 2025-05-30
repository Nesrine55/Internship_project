import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantsService } from '../tenants.service';
import { Tenant } from '../tenant.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateTenantDto } from '../dto/create-tenant.dto';

describe('TenantsService', () => {
  let service: TenantsService;
  let tenantRepository: Repository<Tenant>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: getRepositoryToken(Tenant),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    tenantRepository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));
  });

  describe('create', () => {
    it('should create a tenant successfully', async () => {
      const createTenantDto: CreateTenantDto = { name: 'Test Tenant' };
      const mockTenant = { id: 1, ...createTenantDto } as Tenant;

      jest.spyOn(tenantRepository, 'create').mockReturnValue(mockTenant);
      jest.spyOn(tenantRepository, 'save').mockResolvedValue(mockTenant);

      const result = await service.create(createTenantDto);
      expect(result).toEqual(mockTenant);
      expect(tenantRepository.create).toHaveBeenCalledWith(createTenantDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of tenants', async () => {
      const mockTenants = [
        { id: 1, name: 'Tenant 1' },
        { id: 2, name: 'Tenant 2' },
      ] as Tenant[];

      jest.spyOn(tenantRepository, 'find').mockResolvedValue(mockTenants);

      const result = await service.findAll();
      expect(result).toEqual(mockTenants);
      expect(tenantRepository.find).toHaveBeenCalled();
    });

    it('should return empty array if no tenants', async () => {
      jest.spyOn(tenantRepository, 'find').mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a tenant by id', async () => {
      const mockTenant = { id: 1, name: 'Test Tenant' } as Tenant;
      jest.spyOn(tenantRepository, 'findOne').mockResolvedValue(mockTenant);

      const result = await service.findOne(1);
      expect(result).toEqual(mockTenant);
      expect(tenantRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if tenant not found', async () => {
      jest.spyOn(tenantRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
});