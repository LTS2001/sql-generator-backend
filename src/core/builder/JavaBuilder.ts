import { Provide, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/web';
import { JavaEntityGenerateDTO } from '../model/dto/JavaEntityGenerateDTO';
import { upperCame } from '../model/utils/UpperCame';
import { JavaType } from '../model/enums/FieldTypeEnum';
import { JavaObjectGenerateDTO } from '../model/dto/JavaObjectGenerateDTO';
/**
 * JAVA 生成器
 */
@Provide()
export class JavaBuilder {
  @Inject()
  private ctx: Context;

  /**
   * Java 实体生成封装类
   */
  @Inject()
  private javaEntityGenerateDTO: JavaEntityGenerateDTO;

  /**
   * Java 对象生成封装类
   */
  private javaObjectGenerateDTO: JavaObjectGenerateDTO =
    new JavaObjectGenerateDTO();

  /**
   * 构造 Java 实体代码
   * @param tableSchema 表概要
   * @returns 生成的 java 代码
   */
  buildJavaEntityCode(tableSchema: TableSchema): Promise<string> {
    // 将 tableName 转化为大驼峰命名
    const upperCamelTableName = upperCame(tableSchema.tableName, true);
    // 类名为大驼峰命名的表名
    this.javaEntityGenerateDTO.className = upperCamelTableName;
    // 类注释为表注释
    this.javaEntityGenerateDTO.classComment = tableSchema.tableComment;
    tableSchema.fieldList.forEach(field => {
      this.javaEntityGenerateDTO.fieldList.push({
        comment: field.comment,
        fieldName: field.fieldName,
        javaType: JavaType[field.fieldType],
      });
    });
    return new Promise((resolve, reject) => {
      this.ctx
        .renderView('javaEntity', this.javaEntityGenerateDTO)
        .then(res => {
          resolve(res);
        })
        .catch(error => {
          reject(error.message);
        });
    });
  }

  /**
   * 构造 Java 对象代码
   * @param tableSchema 表概要
   * @param dataList 数据列表
   * @return 生成的 java 代码
   */
  buildJavaObjectCode(
    tableSchema: TableSchema,
    dataList: Array<Map<string, string>>
  ): Promise<string> {
    if (dataList == null) {
      throw new Error('缺少示例数据');
    }
    // 将 dataList 中的 不模拟类型的
    /**
     * 每个对象的 object java 代码
     * 如：
     * Car car1=new Car();
     * car1.carBrand="捷达";
     * car1.carLong=5.3;
     * car1.carColor="red";
     * car1.carPrice=8.9;
     */
    const resultList = [];
    dataList.forEach((data, i) => {
      /**
       * 难点：push 方法中，往里面添加复杂类型的数据，如：数组，对象，
       *      出现整个数组的数据跟最后 push 的数据相同
       * 原因：在使用 push 方法添加复杂类型数据时，push 的是对象的同一个地址
       *      循环地调用 push 方法，所以后面的数据就会将前面的数据给覆盖掉
       * 解决方法：在每次循环前都创建一个新的对象，这样子每次往里面 push 的对象的地址也就都不一样
       */
      this.javaObjectGenerateDTO = new JavaObjectGenerateDTO();
      this.javaObjectGenerateDTO.className = upperCame(
        tableSchema.tableName,
        true
      );
      this.javaObjectGenerateDTO.objectName = upperCame(
        tableSchema.tableName + (i + 1),
        false
      );
      // 循环遍历 map 对象中的属性，并添加到fieldList数组中
      for (const [key, value] of data) {
        this.javaObjectGenerateDTO.fieldList.push({
          setMethod: upperCame('set_' + key, false),
          value: value,
        });
      }
      resultList.push(this.javaObjectGenerateDTO);
    });
    return new Promise((resolve, reject) => {
      this.ctx
        .renderView('javaObject', { resultList })
        .then(res => {
          resolve(res);
        })
        .catch(error => {
          reject(error.message);
        });
    });
  }
}
