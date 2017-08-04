import { Handler, NextFunction, Request, Response } from 'express';
import { FunctionApplication, HTTPApplication } from 'handler.js';

export function middlewareFromFunctionRouter(router: FunctionApplication): Handler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hRes = await router.run({
        body: req.body,
        path: req.path,
      });
      res.json(hRes);
    } catch (err) {
      next(err);
    }
  };
}

export function middlewareFromHTTPRouter(router: HTTPApplication): Handler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ctx = await router.run({
        body: req.body,
        headers: req.headers,
        method: req.method,
        path: req.path,
        query: req.query,
      });
      for (const field of Object.keys(ctx.res.headers)) {
        res.header(field, ctx.res.headers[field] as any);
      }
      if (ctx.res.status) {
        res.status(ctx.res.status);
      }
      if (ctx.res.type) {
        res.type(ctx.res.type);
      }
      if (ctx.res.body) {
        res.send(ctx.res.body);
      } else if (ctx.res.status) {
        res.sendStatus(ctx.res.status);
      } else {
        next(new Error('missing response'));
      }
    } catch (err) {
      next(err);
    }
  };
}
