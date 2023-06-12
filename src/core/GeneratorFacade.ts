import { Provide, Inject } from '@midwayjs/core';
import { SqlBuilder } from './builder/SqlBuilder';
import { DataBuilder } from './builder/DataBuilder';
import { JsonBuilder } from './builder/JsonBuilder';
import { JavaBuilder } from './builder/JavaBuilder';
import { TypescriptBuilder } from './builder/TypescriptBuilder';
import { GenerateVO } from './model/vo/GenerateVO';

@Provide()
export class GenerateFacade {
  @Inject()
  private sqlBuilder: SqlBuilder;
  @Inject()
  private dataBuilder: DataBuilder;
  @Inject()
  private jsonBuilder: JsonBuilder;
  @Inject()
  private javaBuilder: JavaBuilder;
  @Inject()
  private typescriptBuilder: TypescriptBuilder;
  /**
   * 生成所有内容
   */
  async generateAll(tableSchema: TableSchema) {
    // 校验 schema
    this.validSchema(tableSchema);
    // 构造建表 sql
    const buildTableSql = await this.sqlBuilder.buildCreateTableSql(
      tableSchema
    );
    const mockNum = tableSchema.mockNum;
    // 获取（生成）模拟数据列表
    const dataList = this.dataBuilder.generateData(tableSchema, mockNum);
    // 构建插入语句列表
    const insertSql = this.sqlBuilder.buildInsertSql(tableSchema, dataList);
    // 生成 JSON 数据
    const dataJson = this.jsonBuilder.buildJson(dataList);
    // 生成 Java 实体代码
    const javaEntityCode = await this.javaBuilder.buildJavaEntityCode(
      tableSchema
    );
    // 生成 Java 对象代码
    const javaObjectCode = await this.javaBuilder.buildJavaObjectCode(
      tableSchema,
      dataList
    );
    // 生成 Typescript 代码
    const typescriptTypeCode =
      await this.typescriptBuilder.buildTypescriptTypeCode(tableSchema);
    const generateVO: GenerateVO = {
      tableSchema,
      buildTableSql,
      insertSql,
      dataJson,
      javaEntityCode,
      javaObjectCode,
      typescriptTypeCode,
    };
    return generateVO;
  }

  /**
   * 校验 Schema
   */
  private validSchema(tableSchema: TableSchema): void {
    if (Object.keys(tableSchema).length === 0) {
      // 判断 tableSchema 是否是空对象
      throw new Error('数据不能为空！');
    } else if (
      tableSchema.tableName === null ||
      tableSchema.tableName.trim() === ''
    ) {
      // 判断 tableName 是否是空字符串
      throw new Error('表名不能为空!');
    } else if (tableSchema.mockNum == null) {
      // 默认生成 20 条
      tableSchema.mockNum = 20;
    } else if (tableSchema.mockNum < 10 || tableSchema.mockNum > 100) {
      throw new Error('生成条数设置错误！');
    } else if (
      tableSchema.fieldList === null ||
      tableSchema.fieldList.length === 0
    ) {
      throw new Error('字段列表不能为空！');
    }
    // 校验字段列表
    for (const field of tableSchema.fieldList) {
      this.validField(field);
    }
  }

  /**
   * 校验 field
   */
  private validField(field: Field): void {
    if (field.fieldName == null || field.fieldName.trim() === '') {
      throw new Error('字段名不能为空！');
    }
    if (field.fieldType == null || field.fieldType.trim() === '') {
      throw new Error('字段类型不能为空！');
    }
  }
}
