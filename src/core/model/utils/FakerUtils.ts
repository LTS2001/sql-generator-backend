import { Provide, Scope, ScopeEnum } from '@midwayjs/core';
// eslint-disable-next-line node/no-unpublished-import
import { Faker, zh_CN, en } from '@faker-js/faker';
import { MockParamsType } from '../enums/MockParamsTypeEnum';

@Provide()
@Scope(ScopeEnum.Singleton)
export class FakerUtils {
  // 模拟中文
  ZH_FAKER: Faker = new Faker({ locale: [zh_CN] });
  // 模拟英文
  EN_FAKER: Faker = new Faker({ locale: [en] });

  /**
   * 获取随机值
   * @param randomType 模拟类型
   */
  getRandomValue(randomType: MockParamsType): string {
    switch (randomType) {
      case 'NAME':
        return this.ZH_FAKER.person.fullName();
      case 'CITY':
        return this.ZH_FAKER.location.city();
      case 'EMAIL':
        return this.EN_FAKER.internet.email();
      case 'URL':
        return this.EN_FAKER.internet.url();
      case 'IP':
        return this.ZH_FAKER.internet.ipv4();
      case 'INTEGER':
        return this.EN_FAKER.number.int().toString();
      case 'DECIMAL':
        return this.EN_FAKER.number.float().toString();
      case 'UNIVERSITY':
        return 'UNIVERSITY';
      case 'DATE':
        return this.ZH_FAKER.date.anytime().toString();
      case 'TIMESTAMP':
        return 'TIMESTAMP';
      case 'PHONE':
        return this.ZH_FAKER.phone.number();
      default:
        return '';
    }
  }
}
