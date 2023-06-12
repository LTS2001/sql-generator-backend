import { Provide, Scope, ScopeEnum } from '@midwayjs/core';

/**
 * mockType = 不模拟，数据生成器
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class DefaultDataGenerator implements DataGenerate {
  doGenerate(field: Field, rowNum: number): string[] {
    console.log('DefaultDataGenerator');
    // 获取当前字段的 mockParams，eg：'人名'
    let mockParams: string = field.mockParams;
    const list = new Array<string>();
    // 主键采用递增策略
    if (field.primaryKey) {
      mockParams = '1';
      const initValue: number = parseInt(mockParams);
      for (let i = 0; i < rowNum; i++) {
        list.push((initValue + i).toString());
      }
      return list;
    }
    // 获取默认值，默认值不为空，则使用默认值进行模拟
    let defaultValue = field.defaultValue;
    // 特殊逻辑，日期要伪造数据
    if (field.defaultValue === 'CURRENT_TIMESTAMP') {
      defaultValue = new Date().toString();
    }
    if (defaultValue != null || defaultValue !== '') {
      for (let i = 0; i < rowNum; i++) {
        list.push(defaultValue);
      }
    }
    return list;
  }
}
