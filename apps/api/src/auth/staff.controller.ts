import { Controller, Get, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TenantGuard } from './tenant.guard';
import { CreateStaffDto, LoginPinDto } from './dto/staff.dto';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';


@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('auth/staff')
export class StaffController {
  constructor(
     private readonly prisma: PrismaService,
     private readonly authService: AuthService
  ) {}


  @Get()
  async getStaff(@Request() req: any) {
    return this.prisma.user.findMany({
      where: { tenantId: req.tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        pin: true,
        shifts: {
          orderBy: { startTime: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async createStaff(@Request() req: any, @Body() dto: CreateStaffDto) {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      return await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          tenantId: req.tenantId,
          roleId: dto.roleId || undefined,
          pin: dto.pin || undefined,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
         throw new BadRequestException('An account with this email address already exists. Please use a unique email for new staff.');
      }
      throw new BadRequestException(error.message || 'Internal Prisma error');
    }
  }

  @Post('login-pin')
  async loginPin(@Request() req: any, @Body() dto: LoginPinDto) {
    return this.authService.pinLogin(dto.pin, req.tenantId);
  }

  @Post('clock-in')
  async clockIn(@Request() req: any) {
    // Clock in using the current token's user (obtained via pin or email)
    return this.prisma.shift.create({
      data: {
        userId: req.user.sub,
        tenantId: req.tenantId,
        status: 'ACTIVE',
      }
    });
  }

  @Post('clock-out')
  async clockOut(@Request() req: any) {
    const activeShift = await this.prisma.shift.findFirst({
      where: { userId: req.user.sub, tenantId: req.tenantId, status: 'ACTIVE' }
    });

    if (!activeShift) return { success: false, message: 'No active shift' };

    return this.prisma.shift.update({
      where: { id: activeShift.id },
      data: {
        status: 'CLOSED',
        endTime: new Date(),
      }
    });
  }
}

