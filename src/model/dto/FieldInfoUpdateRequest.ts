import { Rule, RuleType } from '@midwayjs/validate';
export class FieldInfoUpdateRequest {
  /**
   * id
   */
  @Rule(RuleType.number().min(0).required())
  id: number;

  /**
   * 名称
   */
  @Rule(RuleType.string().max(20).required())
  name: string;

  /**
   * 字段名称
   */
  @Rule(RuleType.string().max(20).required())
  fieldName: string;

  /**
   * 内容
   */
  @Rule(RuleType.string().max(20000).required())
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
