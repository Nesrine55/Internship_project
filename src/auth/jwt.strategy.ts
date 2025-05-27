import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import { CurrentUser } from './types/current-user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'SECRET_KEY',
      ignoreExpiration: false,
      //passReqToCallback: true 
    });
  }

  async validate(payload: AuthJwtPayload): Promise<CurrentUser> {
    console.log('JwtStrategy.validate called with payload:', payload);
    const user = await this.authService.validateJwtUser(payload.sub);

    console.log('JwtStrategy - returning user:', user); 
    return user;
  }
}