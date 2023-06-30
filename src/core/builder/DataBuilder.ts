import { Provide, Inject } from '@midwayjs/core';
import { MockType } from '../model/enums/MockTypeEnum';
import { DataGeneratorFactory } from '../generator/DataGeneratorFactory';
/**
 * 数据生成器
 */
@Provide()
export class DataBuilder {
  @Inject()
  private dataGeneratorFactory: DataGeneratorFactory;
  /**
   * 生成数据，格式：[{id:1, username:余健柏, city:"广州"},...]
   * @param tableSchema 表概要
   * @param rowNum 生成行数
   */
  generateData(tableSchema: TableSchema, rowNum: number): Array<object> {
    const resultList = [];
    // 依次生成每一列
    tableSchema.fieldList.forEach((field: Field) => {
      // 获取当前字段的 mockType 的 value。eg：NONE INCREASE FIXED RANDOM RULE DICT
      const mockTypeValue: MockType = MockType[field.mockType];
      // 根据 mockTypeValue 获取相对应的实例
      const dataGeneratorInstance: DataGenerate =
        this.dataGeneratorFactory.getGenerator(mockTypeValue);
      // 利用对应的实例获取（模拟）对应的数据
      const mockData: string[] = dataGeneratorInstance.doGenerate(
        field,
        rowNum
      );
      const fieldName = field.fieldName;
      // 整理结果列表
      if (mockData != null) {
        // 判断 resultList 是否为空
        if (resultList.length === 0) {
          // 进行数组的初始化
          for (let i = 0; i < rowNum; i++) {
            resultList.push({});
          }
        }
        mockData.forEach((data, i) => {
          const curObj = { ...resultList[i], [fieldName]: data };
          resultList[i] = curObj;
        });
      }
    });
    return resultList;
  }
}
