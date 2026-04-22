import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto, UpdateTableStatusDto, UpdateTableDto } from './dto/tables.dto';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async createTable(tenantId: string, dto: CreateTableDto) {
    // Verify branch belongs to tenant
    const branch = await this.prisma.branch.findFirst({
      where: { id: dto.branchId, tenantId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return this.prisma.table.create({
      data: {
        name: dto.name,
        capacity: dto.capacity,
        branchId: branch.id,
        x: dto.x || 0,
        y: dto.y || 0,
      },
    });
  }


  async getTables(tenantId: string) {
    return this.prisma.table.findMany({
      where: { branch: { tenantId } },
      include: { branch: true },
    });
  }

  async updateTableStatus(tenantId: string, id: string, dto: UpdateTableStatusDto) {
    const table = await this.prisma.table.findFirst({
      where: { id, branch: { tenantId } },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return this.prisma.table.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async updateTable(tenantId: string, id: string, dto: UpdateTableDto) {
    const table = await this.prisma.table.findFirst({
      where: { id, branch: { tenantId } },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return this.prisma.table.update({
      where: { id },
      data: {
        name: dto.name,
        capacity: dto.capacity,
        ...(dto.x !== undefined && { x: dto.x }),
        ...(dto.y !== undefined && { y: dto.y }),
      },
    });
  }

  async deleteTable(tenantId: string, id: string) {
    const table = await this.prisma.table.findFirst({
      where: { id, branch: { tenantId } },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return this.prisma.table.delete({
      where: { id },
    });
  }
}
