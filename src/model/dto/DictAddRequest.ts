import { Rule, RuleType } from '@midwayjs/validate';

/**
 * 创建请求
 */
export class DictAddRequest {
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
}
