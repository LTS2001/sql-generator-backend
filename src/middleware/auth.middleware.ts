import { UserConstant } from '@/constant/UserConstant';
import { IMiddleware, Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';

@Middleware()
export class AuthMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      ctx.user = ctx.session[UserConstant.USER_LOGIN_STATE];
      await next();
    };
  }

  static getName(): string {
    return 'auth';
  }
}
