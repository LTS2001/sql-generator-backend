import { Rule, RuleType } from '@midwayjs/validate';

/**
 * 用于校验登录请求参数中的参数类型
 */
const requiredString = RuleType.string().required();
export class userLoginRequest {
  /**
   * 用户账号
   */
  @Rule(requiredString.min(4))
  userAccount: string;

  /**
   * 用户密码
   */
  @Rule(requiredString.min(8))
  userPassword: string;
}
