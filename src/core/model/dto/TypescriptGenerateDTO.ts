import { Provide } from '@midwayjs/core';

/**
 * Typescript 类型生成封装类
 */
@Provide()
export class TypescriptGenerateDTO {
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
  fieldList: Array<FieldDTO> = [];
}

class FieldDTO {
  /**
   * 字段名
   */
  fieldName: string;

  /**
   * Typescript 类型
   */
  typescriptType: string;

  /**
   * 字段注释
   */
  comment: string;
}
