import { IMiddleware, Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';

@Middleware()
export class GlobalMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 过滤掉字段值为空字符串的参数
      if (ctx.query) {
        const originQuery = ctx.query;
        const resultQuery = {};
        for (const key in originQuery) {
          if (originQuery[key] !== '') resultQuery[key] = originQuery[key];
        }
        ctx.query = resultQuery;
      }
      if (ctx.request.body) {
        const originBody = ctx.request.body;
        const resultBody = {};
        for (const key in originBody as any) {
          if (originBody[key] !== '') resultBody[key] = originBody[key];
        }
        ctx.request.body = resultBody;
      }
      await next();
    };
  }

  static getName(): string {
    return 'global';
  }
}
