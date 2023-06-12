import { Provide } from '@midwayjs/core';
/**
 * Java 实体生成封装类
 */
@Provide()
export class JavaEntityGenerateDTO {
  /**
   * 类名
   */
  className: string;

  /**
   * 类注释
   */
  classComment: string;

  /**
   * 列信息列表
   */
  fieldList: Array<Field> = [];
}

/**
 * 列信息
 */
class Field {
  /**
   * 字段名
   */
  fieldName: string;

  /**
   * Java 类型
   */
  javaType: string;

  /**
   * 注释（字段中文名）
   */
  comment: string;
}
