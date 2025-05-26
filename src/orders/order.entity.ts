import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column('decimal')
  totalPrice: number;

  @Column()
  status: string; // 'pending', 'completed', 'cancelled'

  @ManyToOne(() => User, user => user.orders)
  user: User;

  @ManyToOne(() => Product, product => product.orders)
  product: Product;
}