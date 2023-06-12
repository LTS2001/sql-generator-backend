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
   * 生成数据，格式：[{id=1, username=余健柏, city="广州"},...]
   * @param tableSchema 表概要
   * @param rowNum 生成行数
   */
  generateData(
    tableSchema: TableSchema,
    rowNum: number
  ): Array<Map<string, string>> {
    const resultList = new Array<Map<string, string>>();
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
        for (let i = 0; i < rowNum; i++) {
          // 判断 resultList 当前是否有值，没有值进入判断进行初始化
          if (!resultList[i]) {
            resultList[i] = new Map<string, string>();
          }
          resultList[i].set(fieldName, mockData[i]);
        }
      }
    });
    return resultList;
  }
}
