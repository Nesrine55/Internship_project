import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';


@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' , session: false}),
    JwtModule.register({
      secret: 'SECRET_KEY', 
      signOptions: { expiresIn: '1h' }, 
    }),
    UsersModule
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy,],
  exports: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
