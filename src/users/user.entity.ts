import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Order } from '../orders/order.entity';

export enum UserRole {
  ADMIN = 'admin',
  SELLER = 'seller',
  CUSTOMER = 'customer',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  email: string;

  @Column({select: false})
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER 
  })
  role: UserRole;

  @ManyToOne(() => Tenant, tenant => tenant.users)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
  

  @OneToMany(() => Order, order => order.user) 
  orders: Order[];
}