import { Provide, Scope, ScopeEnum } from '@midwayjs/core';
/**
 * mockType = 词库值，数据生成
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class DictDataGenerator implements DataGenerate {
  doGenerate(field: Field, rowNum: number): string[] {
    const dictContent: Array<string> = JSON.parse(field.mockParams);
    const list = new Array<string>();
    for (let i = 0; i < rowNum; i++) {
      const randomNum = Math.ceil(Math.random() * (dictContent.length - 1));
      list.push(dictContent[randomNum]);
    }
    return list;
  }
}
