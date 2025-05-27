import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class UserDebugMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Middleware - Incoming Request:', {
      method: req.method,
      path: req.path,
      headers: req.headers,
      user: req.user 
    });
    next();
  }
}