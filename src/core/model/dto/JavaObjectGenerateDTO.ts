/**
 * Java 对象生成封装类
 */
export class JavaObjectGenerateDTO {
  /**
   * 类名
   */
  className: string;

  /**
   * 对象名
   */
  objectName: string;

  /**
   * 列信息列表
   */
  fieldList: Array<FieldDTO> = [];
}

class FieldDTO {
  /**
   * set 方法名
   */
  setMethod: string;

  /**
   * 值
   */
  value: string;
}
