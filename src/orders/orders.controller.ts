import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/user.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)

export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  createOrder(@Body() body: { userId: number; productId: number; quantity: number }) {
    return this.ordersService.createOrder(body.userId, body.productId, body.quantity);
  }

  @Get('user/:userId')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)

  getUserOrders(@Param('userId') userId: number) {
    return this.ordersService.getOrdersByUser(userId);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.SELLER)

  updateStatus(@Param('id') id: number, @Body() body: { status: string }) {
    return this.ordersService.updateStatus(id, body.status);
  }

  @Post(':id/pay')
  @Roles(UserRole.CUSTOMER)

  payOrder(@Param('id') id: number) {
    return this.ordersService.payOrder(id);
  }
}
