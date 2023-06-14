/**
 * @param 第一个参数（必选）：code
 * @param 第二个参数（可选）：data
 * @param 第三个参数（可选）：message
 */
export class BaseResponse<T> {
  code: number;
  data: T;
  message: string;
  // 使用 ES6 中的 rest 来模拟 java 中方法的重写
  constructor(...rest) {
    switch (rest.length) {
      case 1:
        // 只有一个参数，说明是错误的响应
        this.code = rest[0];
        this.data = null;
        this.message = '';
        break;
      case 2:
        // 没有 message 的成功响应
        this.code = rest[0];
        this.data = rest[1];
        this.message = '';
        break;
      case 3:
        // 成功响应
        this.code = rest[0];
        this.data = rest[1];
        this.message = rest[2];
        break;
    }
  }
}
