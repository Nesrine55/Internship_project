import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Product } from '../products/product.entity';
import { User } from 'src/users/user.entity';

@Entity()
export class Seller {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  
  @ManyToOne(() => User)
  user: User;


  @OneToMany(() => Product, product => product.seller)
  products: Product[];
}