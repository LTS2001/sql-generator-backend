import { Rule, RuleType } from '@midwayjs/validate';

export class UserUpdateRequest {
  /**
   * id
   */
  @Rule(RuleType.number().required())
  id: number;

  /**
   * 用户昵称
   */
  @Rule(RuleType.string().max(16))
  userName: string;

  /**
   * 账号
   */
  @Rule(RuleType.string().min(4))
  userAccount: string;

  /**
   * 用户头像
   */
  userAvatar: string;

  /**
   * 性别
   */
  @Rule(RuleType.number())
  gender: number;

  /**
   * 用户角色：user，admin
   */
  userRole: string;

  /**
   * 密码
   */
  @Rule(RuleType.string().min(8))
  userPassword: string;
}
