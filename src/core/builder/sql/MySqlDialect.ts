import { Provide, Scope, ScopeEnum } from '@midwayjs/core';
/**
 * MySQL 方言
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class MySqlDialect implements SqlDialect {
  /**
   * 封装字段名
   * @param name 字段名
   */
  wrapFieldName(name: string): string {
    return `\`${name}\``;
  }

  /**
   * 解析字段名
   * @param name 字段名
   */
  parseFieldName(name: string): string {
    return `\`${name}\``;
  }

  /**
   * 封装表名
   * @param name 表名
   */
  wrapTableName(name: string): string {
    return `\`${name}\``;
  }

  /**
   * 解析表名
   * @param name 表名
   */
  parseTableName(name: string): string {
    return `\`${name}\``;
  }
}
