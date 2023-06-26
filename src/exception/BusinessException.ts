import { MidwayHttpError } from '@midwayjs/core';
import { ErrorCode, ErrorMsg } from '@/common/ErrorCode';

/**
 * 自定义异常类`
 */
export class BusinessException extends MidwayHttpError {
  constructor(code: ErrorCode, msg?: string) {
    super(msg ? msg : ErrorMsg[ErrorCode[code]], code);
  }
}
