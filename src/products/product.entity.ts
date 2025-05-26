import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Seller } from '../sellers/seller.entity';
import { Order } from '../orders/order.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  stock: number;
  
  @Column('decimal')
  price: number;

  @ManyToOne(() => Tenant, tenant => tenant.products)
  tenant: Tenant;

  @ManyToOne(() => Seller, seller => seller.products)
  seller: Seller;

  @OneToMany(() => Order, order => order.product)
  orders: Order[];
}