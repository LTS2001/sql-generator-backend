import { Provide } from '@midwayjs/core';
/**
 * 表概要
 */
@Provide()
export class TableSchema {
  /**
   * 库名
   */
  dbName: string;

  /**
   * 表名
   */
  tableName: string;

  /**
   * 表注释
   */
  tableComment: string;

  /**
   * 模拟数据条数
   */
  mockNum: number;

  /**
   * 列信息列表
   */
  fieldList: Field[] = [];
}

/**
 * 列信息
 */
@Provide()
export class Field {
  /**
   * 字段名
   */
  fieldName: string;

  /**
   * 字段类型
   */
  fieldType: string;

  /**
   * 默认值
   */
  defaultValue: string;

  /**
   * 是否为空
   */
  notNull: boolean;

  /**
   * 注释（字段中文名）
   */
  comment: string;

  /**
   * 是否为主键
   */
  primaryKey: boolean;

  /**
   * 是否自增
   */
  autoIncrement: boolean;

  /**
   * 模拟类型（随机、图片、规则、词库）
   */
  mockType: string;

  /**
   * 模拟参数
   */
  mockParams: string;

  /**
   * 附加条件
   */
  onUpdate: string;
}
