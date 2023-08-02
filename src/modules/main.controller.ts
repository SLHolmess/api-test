import express, { Request } from 'express';
import cors from 'cors';

import { AppController } from 'dth-core';
import { Controller, Route } from 'dth-core/decorators';
import RequestInterceptors from '../middlewares/request-interceptors';

@Controller({
  prefix: '/',
  middlewares: [
    express.json(),
    express.urlencoded({ extended: true }),
    cors(),
    RequestInterceptors
  ]
})
export default class MainController extends AppController {
  @Route('GET /__stats__')
  stats(): any {
    return this.server.apiStats();;
  }
  
  @Route('GET /')
  index(req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string || '').split(',').pop().trim() || req.socket.remoteAddress;
    this.log.info(ip);

    return 'SimVN API Server!';
  }
}