import { Provide, Inject, Init, Scope, ScopeEnum } from '@midwayjs/core';
import { DefaultDataGenerator } from './DefaultDataGenerator';
import { FixedDataGenerator } from './FixedDataGenerator';
import { RandomDataGenerator } from './RandomDataGenerator';
import { IncreaseDataGenerator } from './IncreaseDataGenerator';
import { RuleDataGenerator } from './RuleDataGenerator';
import { MockType } from '../model/enums/MockTypeEnum';

/**
 * 数据生成器工厂
 * 工厂模式 + 单例模式，降低开销
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class DataGeneratorFactory {
  @Inject()
  private defaultDataGenerator: DefaultDataGenerator;
  @Inject()
  private fixedDataGenerator: FixedDataGenerator;
  @Inject()
  private randomDataGenerator: RandomDataGenerator;
  @Inject()
  private increaseDataGenerator: IncreaseDataGenerator;
  @Inject()
  private ruleDataGenerator: RuleDataGenerator;
  /**
   * 模拟类型 => 生成器实例映射
   */
  private mockTypeDataGeneratorMap: Map<MockType, DataGenerate> = new Map<
    MockType,
    DataGenerate
  >();

  @Init()
  generatorInit() {
    // 初始化生成器实例映射
    this.mockTypeDataGeneratorMap
      .set(MockType['不模拟'], this.defaultDataGenerator)
      .set(MockType['固定'], this.fixedDataGenerator)
      .set(MockType['随机'], this.randomDataGenerator)
      .set(MockType['规则'], this.ruleDataGenerator)
      .set(MockType['递增'], this.increaseDataGenerator);
  }
  /**
   * 获取实例
   * @param mockTypeEnum mockType 中的 value 值
   * @return DataGenerator 类型的生成器实例
   */
  getGenerator(mockTypeEnum: MockType): DataGenerate {
    return this.mockTypeDataGeneratorMap.get(mockTypeEnum);
  }
}
