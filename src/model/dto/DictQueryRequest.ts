import { Rule, RuleType } from '@midwayjs/validate';
import { PageRequest } from '@/common/PageRequest';

/**
 * 查询请求
 */
export class DictQueryRequest extends PageRequest {
  /**
   * 名称
   */
  @Rule(RuleType.string().max(30))
  name: string;

  /**
   * 内容（支持模糊查询）
   */
  @Rule(RuleType.string().max(20000))
  content: string;

  /**
   * 状态（0-待审核 1-通过 2-拒绝）
   */
  @Rule(RuleType.number())
  reviewStatus: number;

  /**
   * 创建用户
   */
  @Rule(RuleType.number())
  userId: number;
}
