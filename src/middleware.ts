import { Handler, NextFunction, Request, Response } from 'express';
import { FunctionHandler, FunctionRequest, FunctionRouter,
         HTTPContext, HTTPContextOptions, HTTPHandler, HTTPRouter } from 'handler.js';

function _sendResponse(res: Response, ctx: HTTPContext) {
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
    throw new Error('missing response');
  }
}

export function middlewareFromFunctionRouter(router: FunctionRouter): Handler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hReq = new FunctionRequest({
        body: req.body,
        path: req.path,
      });
      let hRes;
      for (const middleware of router.middlewares) {
        hRes = await (middleware as FunctionHandler)(hReq);
        return res.json(hRes);
      }
      const match = router.matchRoute(hReq.path);
      if (!match) {
        return next();
      }
      hRes = await match.handler(hReq);
      res.json(hRes);
    } catch (err) {
      next(err);
    }
  };
}

export function middlewareFromHTTPRouter(router: HTTPRouter): Handler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const rewritePath = router._rewritePath(req.path);
    if (rewritePath) {
      return res.redirect(302, rewritePath);
    }
    try {
      const options: HTTPContextOptions = {
        body: req.body,
        headers: req.headers,
        method: req.method,
        path: req.path,
        query: req.query,
      };
      let ctx = new HTTPContext(options);
      for (const middleware of router.middlewares) {
        await (middleware as HTTPHandler)(ctx, (err: Error) => {
          if (err) {
            throw err;
          }
        });
      }
      const match = router.matchRoute(req.method, req.path);
      console.log(req.method, req.path);
      if (!match) {
        return res.sendStatus(404);
      }
      options.params = match.params;
      ctx = new HTTPContext(options);
      await match.handler(ctx);
      _sendResponse(res, ctx);
    } catch (err) {
      next(err);
    }
  };
}
