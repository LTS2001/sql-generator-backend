import { Provide, Scope, ScopeEnum } from '@midwayjs/core';
import RandExp from 'randexp';
/**
 * mockType = 规则值，生成数据
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class RuleDataGenerator implements DataGenerate {
  doGenerate(field: Field, rowNum: number): string[] {
    const mockParams: string = field.mockParams;
    const list = new Array<string>();
    const randExp = new RandExp(`${mockParams}`);
    for (let i = 0; i < rowNum; i++) {
      list.push(randExp.gen());
    }
    return list;
  }
}
