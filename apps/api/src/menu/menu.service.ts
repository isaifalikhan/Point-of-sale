import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu.dto';


@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // Categories
  async createCategory(tenantId: string, dto: CreateCategoryDto) {
    return this.prisma.menuCategory.create({
      data: {
        name: dto.name,
        tenantId,
      },
    });
  }

  async getCategories(tenantId: string) {
    return this.prisma.menuCategory.findMany({
      where: { tenantId },
      include: { items: true },
    });
  }

  // Items
  async createMenuItem(tenantId: string, dto: CreateMenuItemDto) {
    const category = await this.prisma.menuCategory.findFirst({
      where: { id: dto.categoryId, tenantId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.menuItem.create({
      data: {
        ...dto,
        tenantId,
      },
    });
  }

  async getMenuItems(tenantId: string) {
    return this.prisma.menuItem.findMany({
      where: { tenantId },
      include: { category: true },
      orderBy: { name: 'asc' }
    });
  }

  async updateMenuItem(tenantId: string, id: string, dto: UpdateMenuItemDto) {
    const item = await this.prisma.menuItem.findFirst({
      where: { id, tenantId },
    });
    if (!item) throw new NotFoundException('Menu item not found');

    return this.prisma.menuItem.update({
      where: { id },
      data: dto,
    });
  }

  async deleteMenuItem(tenantId: string, id: string) {
    const item = await this.prisma.menuItem.findFirst({
      where: { id, tenantId },
    });
    if (!item) throw new NotFoundException('Menu item not found');

    return this.prisma.menuItem.delete({
      where: { id },
    });
  }
}

