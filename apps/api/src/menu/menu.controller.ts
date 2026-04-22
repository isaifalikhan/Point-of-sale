import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateCategoryDto, CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post('categories')
  createCategory(@Request() req: any, @Body() dto: CreateCategoryDto) {
    return this.menuService.createCategory(req.tenantId, dto);
  }

  @Get('categories')
  getCategories(@Request() req: any) {
    return this.menuService.getCategories(req.tenantId);
  }

  @Post('items')
  createMenuItem(@Request() req: any, @Body() dto: CreateMenuItemDto) {
    return this.menuService.createMenuItem(req.tenantId, dto);
  }

  @Get('items')
  getMenuItems(@Request() req: any) {
    return this.menuService.getMenuItems(req.tenantId);
  }

  @Patch('items/:id')
  updateMenuItem(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuService.updateMenuItem(req.tenantId, id, dto);
  }

  @Delete('items/:id')
  deleteMenuItem(@Request() req: any, @Param('id') id: string) {
    return this.menuService.deleteMenuItem(req.tenantId, id);
  }
}

