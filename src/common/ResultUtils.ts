import { Provide } from '@midwayjs/core';
import { BaseResponse } from './BaseResponse';
import { ErrorCode } from './ErrorCode';

@Provide()
export class ResultUtils {
  /**
   * 成功的请求
   * @param data 成功的数据
   * @returns BaseResponse
   */
  success<T>(data: T): BaseResponse<T> {
    return new BaseResponse<T>(0, data, 'OK');
  }

  // 重载签名
  error(code: ErrorCode): BaseResponse<string>;
  error(code: ErrorCode, message: string): BaseResponse<string>;
  error(code: number, message: string): BaseResponse<string>;

  // 实现签名
  error(code: number | ErrorCode, message = ''): BaseResponse<string> {
    // message 为空字符串并且 code 的类型不为 number 说明只传一个参数（ErrorCode）
    if (message === '' && typeof code !== 'number') {
      return new BaseResponse<string>(code);
    } else {
      return new BaseResponse<string>(code, null, message);
    }
  }
}
