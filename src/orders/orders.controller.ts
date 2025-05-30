import { Controller, Post, Get, Patch, Param, Body, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/user.entity';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';
import { UpdateOrderDto } from 'src/orders/dto/update-order.dto';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiParam,
} from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)

export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new order' })
    @ApiResponse({ status: 201, description: 'Order created successfully' })
    createOrder(@Body() createOrderDto: CreateOrderDto) {
        const { userId, productId, quantity } = createOrderDto;

        return this.ordersService.createOrder(userId, productId, quantity);
    }

    @Get('user/:userId')
    @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get orders by user ID' })
    @ApiParam({ name: 'userId', type: Number })
    @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
    getUserOrders(@Param('userId') userId: number) {
        return this.ordersService.getOrdersByUser(userId);
    }

    @Patch(':id/status')
    @Roles(UserRole.ADMIN, UserRole.SELLER)
    @ApiOperation({ summary: 'Update order status' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Order status updated successfully' })
    updateStatus(@Param('id') id: number, @Body() updateOrderDto: UpdateOrderDto) {
        if (!updateOrderDto.status) {
            throw new BadRequestException('Status is required');
        }
        return this.ordersService.updateStatus(id, updateOrderDto.status);
    }

    @Post(':id/pay')
    @Roles(UserRole.CUSTOMER)
    @ApiOperation({ summary: 'Pay for an order' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Order payment processed successfully' })
    payOrder(@Param('id') id: number) {
        return this.ordersService.payOrder(id);
    }


}
