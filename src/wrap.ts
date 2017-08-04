import * as express from 'express';
import { https } from 'firebase-functions';
import { FunctionApplication, FunctionHandler, HTTPApplication, HTTPHandler } from 'handler.js';

import { Handler } from './handler';
import { middlewareFromFunctionRouter, middlewareFromHTTPRouter } from './middleware';

export function fromFunctionHandler(handler: FunctionHandler): Handler {
  const router = new FunctionApplication();
  router.all('*', handler);
  return fromFunctionRouter(router);
}

export function fromFunctionRouter(router: FunctionApplication): Handler {
  const app = express();
  app.use(middlewareFromFunctionRouter(router));
  return https.onRequest(app);
}

export function fromHTTPHandler(handler: HTTPHandler): Handler {
  const router = new HTTPApplication();
  router.all('*', handler);
  return fromHTTPRouter(router);
}

export function fromHTTPRouter(router: HTTPApplication): Handler {
  const app = express();
  app.use(middlewareFromHTTPRouter(router));
  return https.onRequest(app);
}
