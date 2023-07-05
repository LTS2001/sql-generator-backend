import { Controller, Post, Body, Inject, File } from '@midwayjs/core';
import xlsx from 'node-xlsx';

import { GenerateFacade } from '@/core/GeneratorFacade';
import { ResultUtils } from '@/common/ResultUtils';
import { GenerateVO } from '@/core/model/vo/GenerateVO';
import { TableSchemaBuilder } from '@/core/schema/TableSchemaBuilder';
import { TableSchemaRequest } from '@/model/dto/TableSchemaRequest';
import { Context } from '@midwayjs/web';

@Controller('/sql')
export class SqlController {
  @Inject()
  private generatorFacade: GenerateFacade;
  @Inject()
  private resultUtils: ResultUtils;
  @Inject()
  private tableSchemaBuilder: TableSchemaBuilder;
  @Inject()
  ctx: Context;

  @Post('/generate/schema')
  async generateBySchema(@Body() tableSchemaRequest: TableSchemaRequest) {
    const resultData = await this.generatorFacade.generateAll(
      tableSchemaRequest
    );
    return this.resultUtils.success(resultData);
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
  async downloadDataExcel(@Body() tableSchemaReq: GenerateVO) {
    const { dataList } = tableSchemaReq;
    const mockDataList = new Array<Array<object>>();
    const mockDataName = [];
    for (const key in dataList[0]) {
      mockDataName.push(key);
    }
    mockDataList.push(mockDataName);
    dataList.forEach(data => {
      const mockDataValue = [];
      for (const key in data) {
        mockDataValue.push(data[key]);
      }
      mockDataList.push(mockDataValue);
    });
    const buffer = xlsx.build([
      {
        name: `${tableSchemaReq.tableSchema.tableName}表mockData`,
        data: mockDataList,
        options: {},
      },
    ]);
    return buffer;
  }
}
