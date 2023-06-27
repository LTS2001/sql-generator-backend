import { Rule, RuleType } from '@midwayjs/validate';

/**
 * 分页请求
 */
export class PageRequest {
  /**
   * 当前页号
   */
  @Rule(RuleType.number())
  current: number;

  /**
   * 页面大小
   */
  @Rule(RuleType.number())
  pageSize: number;

  /**
   * 排序字段
   */
  @Rule(RuleType.string())
  sortField: string;

  /**
   * 排序顺序（默认升序）
   */
  @Rule(RuleType.string())
  sortOrder: string;
}
