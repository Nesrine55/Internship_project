import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seller } from './seller.entity';
import { CreateSellerDto } from '../users/dto/create-seller.dto';
import { UpdateSellerDto } from '../users/dto/update-seller.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from 'src/users/user.entity';
import { CurrentUser } from 'src/auth/types/current-user';

@Injectable()
export class SellersService {
    constructor(
        @InjectRepository(Seller)
        private sellersRepository: Repository<Seller>,
        private usersService: UsersService,
    ) { }

    async create(createSellerDto: CreateSellerDto): Promise<Seller> {
        const user = await this.usersService.findOne(createSellerDto.userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const seller = this.sellersRepository.create({
            name: createSellerDto.name,
            user,
        });
        return this.sellersRepository.save(seller);
    }

    async findAll(): Promise<Seller[]> {
        return this.sellersRepository.find({ relations: ['user', 'products'] });
    }

    async findOne(id: number): Promise<Seller> {
        const seller = await this.sellersRepository.findOne({
            where: { id },
            relations: ['user', 'products'],
        });
        if (!seller) throw new NotFoundException('Seller not found');
        return seller;
    }

    async update(id: number, updateSellerDto: UpdateSellerDto): Promise<Seller> {
        const seller = await this.findOne(id);

        if (updateSellerDto.userId) {
            const user = await this.usersService.findOne(updateSellerDto.userId);
            if (!user) throw new NotFoundException('User not found');
            seller.user = user;
        }

        if (updateSellerDto.name) {
            seller.name = updateSellerDto.name;
        }

        return this.sellersRepository.save(seller);
    }

    async remove(id: number): Promise<void> {
        const seller = await this.findOne(id);
        await this.sellersRepository.remove(seller);
    }

    async findAllByTenant(tenantId: number) {
        return this.sellersRepository.find({
            where: { user: { tenantId } },
            relations: ['user', 'products'],
        });
    }

    async findOneByUserId(userId: number) {
        return this.sellersRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user', 'products'],
        });
    }

    async findSellersByUser(user: CurrentUser): Promise<Seller[]> {
    if (user.role === UserRole.ADMIN) {
      // Admin : tous les sellers du tenant
      return this.sellersRepository.find({
        where: { user: { tenantId: user.tenantId } },
        relations: ['user', 'products'],
      });
    } else if (user.role === UserRole.SELLER) {
      return this.sellersRepository.find({
        where: { user: { id: user.id } },
        relations: ['user', 'products'],
      });
    } else {
      return [];
    }
  }

}
