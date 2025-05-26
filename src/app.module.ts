import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { SellersModule } from './sellers/sellers.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [UsersModule, TenantsModule, SellersModule, ProductsModule, OrdersModule, TypeOrmModule.forRoot({
   
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin', 
      database: 'nest_project', 
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
      extra: { 
        trustServerCertificate: true 
      }
    })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
