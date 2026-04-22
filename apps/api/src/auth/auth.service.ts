import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create Tenant and Owner User in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      const tenant = await prisma.tenant.create({
        data: {
          name: dto.businessName,
          businessType: dto.businessType,
          branches: {
            create: {
              name: 'Main Branch',
            }
          }
        },
      });


      const user = await prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          tenantId: tenant.id,
        },
      });

      return { user, tenant };
    });

    return this.generateTokens(result.user.id, result.user.tenantId, result.tenant.businessType);
  }


  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId }
    });

    const tokens = this.generateTokens(user.id, user.tenantId, tenant?.businessType || 'RESTAURANT');
    return { ...tokens, user: { name: user.name, role: user.role?.name || 'Admin' } };
  }

  async pinLogin(pin: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { pin, tenantId },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid PIN code');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId }
    });

    const tokens = this.generateTokens(user.id, user.tenantId, tenant?.businessType || 'RESTAURANT');
    return { ...tokens, user: { name: user.name, role: user.role?.name || 'Admin' } };
  }


  private generateTokens(userId: string, tenantId: string, businessType: string) {
    const payload = { sub: userId, tenantId, businessType };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

}
