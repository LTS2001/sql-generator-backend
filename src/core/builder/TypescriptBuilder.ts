import { Provide, Inject } from '@midwayjs/core';
import { TypescriptGenerateDTO } from '../model/dto/TypescriptGenerateDTO';
import { upperCame } from '../model/utils/UpperCame';
import { TypeScriptType } from '../model/enums/FieldTypeEnum';
import { Context } from '@midwayjs/web';

/**
 * Typescript 代码生成器
 */
@Provide()
export class TypescriptBuilder {
  /**
   * typescript 类型封装类
   */
  @Inject()
  typescriptGenerateDTO: TypescriptGenerateDTO = new TypescriptGenerateDTO();

  @Inject()
  ctx: Context;
  /**
   * 构造 TypeScript 类型代码
   * @param tableSchema 表概要
   */
  buildTypescriptTypeCode(tableSchema: TableSchema): Promise<string> {
    this.typescriptGenerateDTO.className = upperCame(
      tableSchema.tableName,
      true
    );
    this.typescriptGenerateDTO.classComment = tableSchema.tableComment;
    tableSchema.fieldList.forEach(field => {
      this.typescriptGenerateDTO.fieldList.push({
        comment: field.comment,
        fieldName: field.fieldName,
        typescriptType: TypeScriptType[field.fieldType],
      });
    });
    return new Promise((resolve, reject) => {
      this.ctx
        .renderView('typescriptType', this.typescriptGenerateDTO)
        .then(res => {
          resolve(res);
        })
        .catch(error => {
          reject(error.message);
        });
    });
  }
}
