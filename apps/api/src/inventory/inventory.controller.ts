import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  getInventory(@Request() req: any) {
    return this.inventoryService.getInventory(req.tenantId);
  }

  @Get('stats')
  getStats(@Request() req: any) {
    return this.inventoryService.getInventoryStats(req.tenantId);
  }

  @Post()
  createIngredient(@Request() req: any, @Body() body: any) {
    return this.inventoryService.createIngredient(req.tenantId, body);
  }

  @Patch(':id/stock')
  updateStock(@Request() req: any, @Param('id') id: string, @Body() body: { amount: number }) {
    return this.inventoryService.updateStock(req.tenantId, id, body.amount);
  }

  @Get('recipe/:menuItemId')
  getRecipe(@Request() req: any, @Param('menuItemId') menuItemId: string) {
    return this.inventoryService.getMenuItemIngredients(req.tenantId, menuItemId);
  }

  @Post('recipe/:menuItemId')
  linkIngredient(@Request() req: any, @Param('menuItemId') menuItemId: string, @Body() body: { ingredientId: string; quantity: number }) {
    return this.inventoryService.linkIngredientToMenuItem(req.tenantId, menuItemId, body);
  }
}
