import { Provide } from '@midwayjs/core';
import { BaseResponse } from './BaseResponse';

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
}
