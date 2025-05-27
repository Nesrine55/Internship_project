import { Module } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { SellersController } from './sellers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seller } from './seller.entity'; // à créer
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Seller]), UsersModule],
    controllers: [SellersController],
    providers: [SellersService],
    exports: [SellersService],
})
export class SellersModule { }