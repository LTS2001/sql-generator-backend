import { Inject, Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';
import { BusinessException } from '@/exception/BusinessException';
import { ErrorCode } from '@/common/ErrorCode';

@Middleware()
export class JwtMiddleware {
  @Inject()
  jwtService: JwtService;

  public static getName(): string {
    return 'jwt';
  }

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 判断 header 有没有校验信息
      if (!ctx.headers['authorization']) {
        throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
      }

      // 从 header 上获取校验信息 -> [Bearer, token 字符串]
      const parts = ctx.get('authorization').trim().split(' ');

      if (parts.length !== 2) {
        throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
      }

      const [scheme, token] = parts;

      if (/^Bearer$/i.test(scheme)) {
        try {
          //jwt.verify 方法验证 token 是否有效
          await this.jwtService.verify(token, {
            complete: true,
          });
          // 将用户信息挂在在 ctx.userInfo 上
          ctx.userInfo = this.jwtService.decode(token);
        } catch (error) {
          throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }
        await next();
      }
    };
  }
}
