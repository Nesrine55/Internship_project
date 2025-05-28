import { Controller, Post, Get, Patch, Param, Body, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/user.entity';
import { CreateOrderDto } from 'src/users/dto/create-order.dto';
import { UpdateOrderDto } from 'src/users/dto/update-order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)

export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
    createOrder(@Body() createOrderDto: CreateOrderDto) {
        const { userId, productId, quantity } = createOrderDto;

        return this.ordersService.createOrder(userId, productId, quantity);
    }

    @Get('user/:userId')
    @Roles(UserRole.CUSTOMER, UserRole.ADMIN)

    getUserOrders(@Param('userId') userId: number) {
        return this.ordersService.getOrdersByUser(userId);
    }

    @Patch(':id/status')
    @Roles(UserRole.ADMIN, UserRole.SELLER)

    updateStatus(@Param('id') id: number, @Body() updateOrderDto: UpdateOrderDto) {
        if (!updateOrderDto.status) {
            throw new BadRequestException('Status is required');
        }
        return this.ordersService.updateStatus(id, updateOrderDto.status);
    }

    @Post(':id/pay')
    @Roles(UserRole.CUSTOMER)

    payOrder(@Param('id') id: number) {
        return this.ordersService.payOrder(id);
    }
}
