import { ErrorCode, ErrorMsg } from './ErrorCode';

export class BaseResponse<T> {
  code: number | ErrorCode;
  data: T;
  message: string;

  // 重载签名
  constructor(code: number, data: T, message: string);
  constructor(code: number, data: T);
  constructor(code: ErrorCode);

  // 实现签名
  constructor(code: number | ErrorCode, data: T | null = null, message = '') {
    if (typeof code === 'number') {
      this.code = code;
      this.data = data;
      this.message = message;
    } else {
      this.code = code;
      this.data = null;
      this.message = ErrorMsg[ErrorCode[code]];
    }
  }
}
