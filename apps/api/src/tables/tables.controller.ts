import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableStatusDto, UpdateTableDto } from './dto/tables.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  createTable(@Request() req: any, @Body() dto: CreateTableDto) {
    return this.tablesService.createTable(req.tenantId, dto);
  }

  @Get()
  getTables(@Request() req: any) {
    return this.tablesService.getTables(req.tenantId);
  }

  @Patch(':id/status')
  updateTableStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTableStatusDto,
  ) {
    return this.tablesService.updateTableStatus(req.tenantId, id, dto);
  }

  @Patch(':id')
  updateTable(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTableDto,
  ) {
    return this.tablesService.updateTable(req.tenantId, id, dto);
  }

  @Delete(':id')
  deleteTable(@Request() req: any, @Param('id') id: string) {
    return this.tablesService.deleteTable(req.tenantId, id);
  }
}
