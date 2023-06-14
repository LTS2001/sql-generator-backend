import { Controller, Post, Body, Inject, File } from '@midwayjs/core';
import xlsx from 'node-xlsx';

import { GenerateFacade } from '@/core/GeneratorFacade';
import { ResultUtils } from '@/common/ResultUtils';
import { GenerateVO } from '@/core/model/vo/GenerateVO';
import { TableSchemaBuilder } from '@/core/schema/TableSchemaBuilder';

@Controller('/sql')
export class SqlController {
  @Inject()
  private generatorFacade: GenerateFacade;
  @Inject()
  private resultUtils: ResultUtils;
  @Inject()
  private tableSchemaBuilder: TableSchemaBuilder;

  @Post('/generate/schema')
  async generateBySchema(@Body() tableSchema: TableSchema) {
    return new Promise((resolve, reject) => {
      try {
        resolve(this.generatorFacade.generateAll(tableSchema));
      } catch (error) {
        reject(error.message);
      }
    })
      .then(res => {
        return this.resultUtils.success(res as GenerateVO);
      })
      .catch(error => {
        return error;
      });
  }

  @Post('/get/schema/auto')
  async getSchemaByAuto(@Body() autoRequest) {
    if (autoRequest == null) {
      throw new Error('请求参数错误');
    }
    return new Promise((resolve, reject) => {
      // try catch 是处理 buildFormAuto 中抛出的错误
      try {
        resolve(this.tableSchemaBuilder.buildFormAuto(autoRequest));
      } catch (error) {
        reject(error.message);
      }
    })
      .then(res => {
        return this.resultUtils.success(res as TableSchema);
      })
      .catch(error => {
        return error;
      });
  }

  @Post('/get/schema/sql')
  async getSchemaBySql(@Body() sqlRequest) {
    return this.resultUtils.success(
      this.tableSchemaBuilder.buildFromSql(sqlRequest)
    );
  }

  @Post('/get/schema/excel')
  async getSchemaByExcel(@File() file) {
    // 在 file 中可以拿到上传到服务器的文件的地址，可以设置服务器文件失效的时间（失效后删除）
    return this.resultUtils.success(
      this.tableSchemaBuilder.buildFromExcel(file.data)
    );
  }

  @Post('/download/data/excel')
  async downloadDataExcel() {
    const data = [
      ['1', '2', '3'],
      ['true', 'false', 'null'],
      ['foo', 'bar', '0.3'],
      ['baz', 'null', 'qux'],
    ];
    console.log(data);
    const buffer = xlsx.build([{ name: 'mySheetName', data, options: {} }]);
    console.log(buffer);
    return buffer;
  }
}
