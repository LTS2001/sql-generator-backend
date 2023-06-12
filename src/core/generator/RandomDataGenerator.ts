import { Provide, Inject, Scope, ScopeEnum } from '@midwayjs/core';
import { MockParamsType } from '../model/enums/MockParamsTypeEnum';
import { FakerUtils } from '../model/utils/FakerUtils';
/**
 * mockType = 随机值，数据生成
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class RandomDataGenerator implements DataGenerate {
  @Inject()
  fakerUtils: FakerUtils;

  doGenerate(field: Field, rowNum: number): string[] {
    console.log('RandomDataGenerator');
    const mockParams: string = field.mockParams;
    const list = new Array<string>();
    const randomType = MockParamsType[mockParams];
    for (let i = 0; i < rowNum; i++) {
      const randomString = this.fakerUtils.getRandomValue(randomType);
      list.push(randomString);
    }
    return list;
  }
}
