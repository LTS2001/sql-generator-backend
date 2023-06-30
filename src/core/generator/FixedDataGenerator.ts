import { Provide, Scope, ScopeEnum } from '@midwayjs/core';
/**
 * mockType = 固定值，数据生成器
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class FixedDataGenerator implements DataGenerate {
  doGenerate(field: Field, rowNum: number): string[] {
    let mockParams: string = field.mockParams;
    const list = new Array<string>();
    if (mockParams == null || mockParams === '') {
      mockParams = '6';
    }
    for (let i = 0; i < rowNum; i++) {
      list.push(mockParams);
    }
    return list;
  }
}
