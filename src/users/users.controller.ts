import { Controller, Get, Request, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from './user.entity';
import { UsersService } from './users.service'


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }


  @Get('profile-seller')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  getProfileSeller(@Request() req) {
    console.log('Controller - Verified user:', req.user);
    return this.usersService.findOne(req.user.id);
  }




  @Get('profile-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  testAdmin() {
    return 'test admin';
  }




  @Get('profile-customer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  testCustomer() {
    return 'test admin';
  }
}



