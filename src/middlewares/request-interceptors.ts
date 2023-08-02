import {Request, Response, NextFunction} from 'express';
import { randomUUID } from 'crypto';

import { AppLogger } from 'dth-core';

export default function RequestInterceptors(req: Request, res: Response, next: NextFunction){
  const start = Date.now();

  // Identify request id
  const requestId = randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);

  // Log request just like morgan
  res.on('finish', () => {
    const contentLength = res.hasHeader('content-length') ? res.getHeader('content-length') : 'n/a';
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - Content ${contentLength} - ${Date.now() - start}ms`;

    AppLogger.log(res.statusCode < 400 ? 'info' : 'error', message, { 
      req_headers: {...req.headers, 'x-access-token': undefined}, 
      req_body: req.body,
      status: res.statusCode
    })
  });

  next();
}