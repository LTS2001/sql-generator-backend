import { Catch, MidwayHttpError } from '@midwayjs/core';
import { ResultUtils } from '@/common/ResultUtils';

/**
 * 全局异常处理器
 */
@Catch()
export class GlobalExceptionHandler {
  async catch(err: MidwayHttpError) {
    return new ResultUtils().error(err.status, err.message);
  }
}
