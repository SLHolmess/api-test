import { body } from 'express-validator';
import { Request, Response } from "express";
import { AppController, AppException, validate } from "dth-core";
import AuthProvider from "../../includes/auth";
import { hashPassword, generateSalt } from '../../includes/helper';

// Models
import User from "./models/user.model";
import { Controller, Route } from 'dth-core/decorators';

@Controller({
  prefix: '/users'
})
export default class UserController extends AppController {
  @Route('POST /login', [
    body('username').notEmpty().withMessage('Username không được để trống'),
    body('password').notEmpty().withMessage('Password không được để trống'),
  ])
  async login(req: Request) {
    const username = req.body.username;
    const user = await User.findOne({ username });

    if (!user) throw new AppException("USERNAME_NOT_FOUND", "Không tìm thấy user");

    if (user.password !== hashPassword(user.salt, req.body.password))
      throw new AppException("PASSWORD_INVALID", "Password không đúng");

    // Login success
    const token = AuthProvider.sign({
      id: user._id.toString(),
      username: user.username,
      is_root: user.is_root ? user.is_root : false
    });

    return {
      user: {
        ...user.toObject()
      },
      token
    } as any
  }

  @Route('POST /register', [
    body('username').notEmpty().withMessage('Username không được để trống'),
    body('password').notEmpty().withMessage('Password không được để trống'),
  ])
  async register(req: Request) {
    const username = req.body.username;

    // Check dupplicate phone number
    const isUsernameDuplicated = await User.countDocuments({ username});
    if (isUsernameDuplicated) throw new AppException('DUPLICATED_PHONE_NUMBER', 'Username đã được đăng ký')

    // Create user
    const salt = generateSalt();
    const hashedPassword = hashPassword(salt, req.body.password);
    
    const user = await User.create({
      username: username,
      salt: salt,
      password: hashedPassword,
      is_root: username == 'admin' ? true : false
    });

    return {
      user: {
        ...user.toObject(),
      } as any,
      token: AuthProvider.sign({
        id: user._id,
        username: user.username,
        is_root: user.is_root,
      })
    }
  }

}