import { IMiddleware, Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';

@Middleware()
export class GlobalMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      function trimObjNUllStr(needHandleObj) {
        const resultBody = {};
        for (const key in needHandleObj as any) {
          if (
            needHandleObj[key] &&
            typeof needHandleObj[key] === 'object' &&
            needHandleObj[key] instanceof Array
          ) {
            const arr = [];
            needHandleObj[key].forEach(item => {
              arr.push(trimObjNUllStr(item));
            });
            needHandleObj[key] = arr;
          }
          if (needHandleObj[key] !== '') resultBody[key] = needHandleObj[key];
        }
        return resultBody;
      }
      // 过滤掉字段值为空字符串的参数
      if (ctx.query) {
        const originQuery = ctx.query;
        ctx.query = trimObjNUllStr(originQuery);
      }
      if (ctx.request.body) {
        const originBody = ctx.request.body;
        ctx.request.body = trimObjNUllStr(originBody);
      }
      await next();
    };
  }

  static getName(): string {
    return 'global';
  }
}
