import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/orders.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Request() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.tenantId, req.user.sub, dto);
  }

  @Get()
  getOrders(@Request() req: any, @Query('branchId') branchId?: string) {
    return this.ordersService.getOrders(req.tenantId, branchId);
  }

  @Patch(':id/status')
  updateOrderStatus(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(req.tenantId, id, dto);
  }

  @Patch(':id/items/:itemId/status')
  updateOrderItemStatus(@Request() req: any, @Param('id') orderId: string, @Param('itemId') itemId: string, @Body() body: { status: any }) {
    return this.ordersService.updateOrderItemStatus(req.tenantId, orderId, itemId, body.status);
  }
}
