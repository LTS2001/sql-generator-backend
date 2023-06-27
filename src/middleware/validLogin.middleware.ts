import { ErrorCode } from '@/common/ErrorCode';
import { UserConstant } from '@/constant/UserConstant';
import { BusinessException } from '@/exception/BusinessException';
import { IMiddleware, Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';

@Middleware()
export class ValidLogin implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (context: Context, next: NextFunction) => {
      const curUser = context.session[UserConstant.USER_LOGIN_STATE];
      if (curUser == null)
        throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
      await next();
    };
  }
  static getName(): string {
    return 'validLogin';
  }
}
