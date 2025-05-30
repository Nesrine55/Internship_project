import { Controller, Get, Request, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from './user.entity';
import { UsersService } from './users.service'

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }


  @Get('profile-seller')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @ApiOperation({ summary: 'Get seller profile (Seller only)' })
  @ApiResponse({ status: 200, description: 'Seller profile data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (not a seller)' })
  getProfileSeller(@Request() req) {
    console.log('Controller - Verified user:', req.user);
    return this.usersService.findOne(req.user.id);
  }




  @Get('profile-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin test endpoint (Admin only)' })
  @ApiResponse({ status: 200, description: 'Admin access confirmed' })
  testAdmin() {
    return 'test admin';
  }




  @Get('profile-customer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Customer test endpoint (Customer only)' })
  @ApiResponse({ status: 200, description: 'Customer access confirmed' })
  testCustomer() {
    return 'test admin';
  }
}



