import { Provide, Scope, ScopeEnum } from '@midwayjs/core';
/**
 * mockType = 递增值，数据生成
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class IncreaseDataGenerator implements DataGenerate {
  doGenerate(field: Field, rowNum: number): string[] {
    let mockParams: string = field.mockParams;
    const list = new Array<string>();
    if (mockParams == null) {
      mockParams = '1';
    }
    const initValue = parseInt(mockParams);
    for (let i = 0; i < rowNum; i++) {
      list.push((initValue + i).toString());
    }
    return list;
  }
}
