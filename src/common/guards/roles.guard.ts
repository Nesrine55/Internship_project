import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from 'src/users/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Log the required roles
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    this.logger.debug(`Required roles: ${JSON.stringify(requiredRoles)}`);

    if (!requiredRoles) {
      this.logger.debug('No roles required, access granted');
      return true;
    }

    // 2. Log the user object
    const { user } = context.switchToHttp().getRequest();
    this.logger.debug(`User in request: ${JSON.stringify(user)}`);

    if (!user) {
      this.logger.warn('No user found in request');
      return false;
    }

    // 3. Compare roles with explicit logging
    const hasRole = requiredRoles.some((role) => {
      const result = user.role === role;
      this.logger.debug(`Checking role ${user.role} against ${role}: ${result}`);
      return result;
    });

    if (!hasRole) {
      this.logger.warn(`User role ${user.role} not in required roles: ${requiredRoles.join(', ')}`);
    }

    return hasRole;
  }
}
