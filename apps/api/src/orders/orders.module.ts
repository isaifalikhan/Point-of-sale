import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  controllers: [OrdersController, AnalyticsController],
  providers: [OrdersService]
})
export class OrdersModule {}
