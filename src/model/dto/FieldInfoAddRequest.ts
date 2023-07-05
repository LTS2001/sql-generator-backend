import { Rule, RuleType } from '@midwayjs/validate';
/**
 * 创建请求
 */
export class FieldInfoAddRequest {
  /**
   * 名称
   */
  @Rule(RuleType.string().required().max(30))
  name: string;

  /**
   * 内容
   */
  @Rule(RuleType.string().required().max(20000))
  content: string;

  /**
   * 状态（0-待审核 1-通过 2-拒绝）
   */
  @Rule(RuleType.number())
  reviewStatus: number;

  /**
   * 审核信息
   */
  @Rule(RuleType.string())
  reviewMessage: string;
}
