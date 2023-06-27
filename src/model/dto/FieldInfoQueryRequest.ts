import { Rule, RuleType } from '@midwayjs/validate';
import { PageRequest } from '@/common/PageRequest';

/**
 * 查询请求
 */
export class FieldInfoQueryRequest extends PageRequest {
  /**
   * 同时搜索名称或字段名称
   */
  @Rule(RuleType.string())
  searchName: string;

  /**
   * 名称
   */
  @Rule(RuleType.string().max(30))
  name: string;

  /**
   * 字段名称
   */
  @Rule(RuleType.string().max(30))
  fieldName: string;

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
