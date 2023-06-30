import { Provide, Inject } from '@midwayjs/core';
import { SqlBuilder } from './builder/SqlBuilder';
import { DataBuilder } from './builder/DataBuilder';
import { JsonBuilder } from './builder/JsonBuilder';
import { JavaBuilder } from './builder/JavaBuilder';
import { TypescriptBuilder } from './builder/TypescriptBuilder';
import { GenerateVO } from './model/vo/GenerateVO';
import { TableSchemaRequest } from '@/model/dto/TableSchemaRequest';

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
  async generateAll(tableSchema: TableSchemaRequest) {
    // 构造建表 sql
    const buildTableSql = await this.sqlBuilder.buildCreateTableSql(
      tableSchema
    );
    // 获取（生成）模拟数据列表
    const dataList = this.dataBuilder.generateData(
      tableSchema,
      tableSchema.mockNum
    );
    // 构建插入语句列表
    const insertSql = this.sqlBuilder.buildInsertSql(tableSchema, dataList);
    // 生成 JSON 数据
    const dataJson = await this.jsonBuilder.buildJson(dataList);
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
      dataList,
      javaEntityCode,
      javaObjectCode,
      typescriptTypeCode,
    };
    return generateVO;
  }
}
