import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Validate if the authenticated user has a tenantId
    if (!user || !user.tenantId) {
      throw new ForbiddenException('Tenant access required.');
    }

    // Bind tenantId to the request for easy access in controllers/services
    request.tenantId = user.tenantId;

    return true;
  }
}
