import { Rule, RuleType } from '@midwayjs/validate';

const requiredString = RuleType.string().required();
/**
 * 用户创建请求，用于校验 body 中的参数
 */
export class UserAddRequest {
  /**
   * 用户昵称
   */
  @Rule(requiredString.max(16))
  userName: string;

  /**
   * 账号
   */
  @Rule(requiredString.min(4))
  userAccount: string;

  /**
   * 用户头像
   */
  @Rule(RuleType.string())
  userAvatar: string;

  /**
   * 性别
   */
  @Rule(RuleType.number())
  gender: number;

  /**
   * 用户角色
   */
  @Rule(RuleType.string())
  userRole: string;

  /**
   * 密码
   */
  @Rule(requiredString.min(8))
  userPassword: string;
}
