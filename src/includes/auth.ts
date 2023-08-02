import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { jwtSecret } from '../includes/config';

export default class AuthProvider {
  static sign(user: any) {
    return jwt.sign(user, jwtSecret);
  }

  static requireAuth() {
    return async (req: any, res: Response, next: NextFunction) => {
      try {
        const token: any = req.headers['x-access-token'] || req.header('Authorization');
        const decoded: any = jwt.verify(token, jwtSecret);
        req.user = decoded;

        return next();
      } catch (err) {
        if(err.httpCode) res.status(err.httpCode);

        res.json({ 
          success: false,
          code: err.code || 'AUTHENTICATION_ERROR',
          message: err.code ? err.message : 'Token không hợp lệ hoặc đã hết hạn.'
        });
      }
    };
  }
}
