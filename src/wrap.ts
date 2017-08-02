import * as express from 'express';
import { https } from 'firebase-functions';
import { FunctionHandler, FunctionRouter, HTTPHandler, HTTPRouter } from 'handler.js';

import { Handler } from './handler';
import { middlewareFromFunctionRouter, middlewareFromHTTPRouter } from './middleware';

export function fromFunctionHandler(handler: FunctionHandler): Handler {
  const router = new FunctionRouter();
  router.all('*', handler);
  return fromFunctionRouter(router);
}

export function fromFunctionRouter(router: FunctionRouter): Handler {
  const app = express();
  app.use(middlewareFromFunctionRouter(router));
  return https.onRequest(app);
}

export function fromHTTPHandler(handler: HTTPHandler): Handler {
  const router = new HTTPRouter();
  router.all('*', handler);
  return fromHTTPRouter(router);
}

export function fromHTTPRouter(router: HTTPRouter): Handler {
  const app = express();
  app.use(middlewareFromHTTPRouter(router));
  return https.onRequest(app);
}
