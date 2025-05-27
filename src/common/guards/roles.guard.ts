import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from 'src/users/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {

  constructor(private reflector: Reflector) { }
  canActivate(
    context: ExecutionContext,
  ): boolean {
    console.log('RolesGuard: checking access control...');


    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('RolesGuard: No roles required, access granted');

      return true;
    }

    const user = context.switchToHttp().getRequest().user;

    console.log('RolesGuard executed, user:', user);
    console.log('RolesGuard - requiredRoles:', requiredRoles);
    if (!user) {
      console.warn('RolesGuard: No user found in request — access denied');
      return false;
    }
    const hasRole = requiredRoles.some(role => user.role === role);
    console.log(`RolesGuard: Access ${hasRole ? 'granted' : 'denied'}`);
    return hasRole;
  }
}