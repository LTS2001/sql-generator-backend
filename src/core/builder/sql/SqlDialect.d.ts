/**
 * SQL 方言
 */
interface SqlDialect {
  /**
   * 封装字段名
   * @param name 字段名
   */
  wrapFieldName(name: string): string;

  /**
   * 解析字段名
   * @param name 字段名
   */
  parseFieldName(name: string): string;

  /**
   * 封装表名
   * @param name 表名
   */
  wrapTableName(name: string): string;

  /**
   * 解析表名
   * @param name 表名
   */
  parseTableName(name: string): string;
}
