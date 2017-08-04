import * as express from 'express';
import { https } from 'firebase-functions';
import { FunctionApplication, FunctionHandler, HTTPApplication, HTTPHandler } from 'handler.js';

import { Handler } from './handler';
import { middlewareFromFunctionApplication, middlewareFromHTTPApplication } from './middleware';

export function fromFunctionApplication(_app: FunctionApplication): Handler {
  const app = express();
  app.use(middlewareFromFunctionApplication(_app));
  return https.onRequest(app);
}

export function fromFunctionHandler(handler: FunctionHandler): Handler {
  const app = new FunctionApplication();
  app.all('*', handler);
  return fromFunctionApplication(app);
}

export function fromHTTPApplication(_app: HTTPApplication): Handler {
  const app = express();
  app.use(middlewareFromHTTPApplication(_app));
  return https.onRequest(app);
}

export function fromHTTPHandler(handler: HTTPHandler): Handler {
  const app = new HTTPApplication();
  app.all('*', handler);
  return fromHTTPApplication(app);
}
