import { PageRequest } from '@/common/PageRequest';
import { Rule, RuleType } from '@midwayjs/validate';

export class UserQueryRequest extends PageRequest {
  /**
   * id
   */
  @Rule(RuleType.number())
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
   * 创建时间
   */
  @Rule(RuleType.date())
  createTime: Date;

  /**
   * 更新时间
   */
  @Rule(RuleType.date())
  updateTime: Date;
}
