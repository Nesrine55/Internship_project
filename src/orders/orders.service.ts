import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async createOrder(userId: number, productId: number, quantity: number): Promise<Order> {
    const user = await this.userRepository.findOneBy({ id: userId });
    const product = await this.productRepository.findOneBy({ id: productId });

    if (!user || !product) throw new NotFoundException('User or Product not found');

    const totalPrice = product.price * quantity;

    const order = this.orderRepository.create({
      user,
      product,
      quantity,
      totalPrice,
      status: 'pending',
    });

    return this.orderRepository.save(order);
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
    });
  }

  async updateStatus(orderId: number, status: string): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order) throw new NotFoundException('Order not found');

    order.status = status;
    return this.orderRepository.save(order);
  }


  async payOrder(orderId: number) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status === 'pending') {
      order.status = 'paid';
      return this.orderRepository.save(order);
    } else {
      return { message: 'Order already paid or not eligible' };
    }
  }
}
