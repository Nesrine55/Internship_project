import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from './user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {

  @Get('admin-data')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminData(@Request() req) {
    return {
      message: 'Données accessibles uniquement aux administrateurs.',
      user: req.user,
    };
  }

  
  @Get('seller-data')
  @Roles(UserRole.SELLER)
  @UseGuards(RolesGuard)
  getSellerData(@Request() req) {
    console.log('User in controller:', req.user);
    return { message: 'Accès autorisé', user: req.user };

  }


  @Get('customer-data')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  getCustomerData(@Request() req) {
    return {
      message: 'Données accessibles uniquement aux clients.',
      user: req.user,
    };
  }
}
