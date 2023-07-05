import { Provide, Scope, ScopeEnum } from '@midwayjs/core';
// eslint-disable-next-line node/no-unpublished-import
import { Faker, zh_CN, en } from '@faker-js/faker';
import moment from 'moment';
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
      case 'IPV4':
        return this.ZH_FAKER.internet.ipv4();
      case 'INTEGER':
        return this.EN_FAKER.number
          .bigInt({
            min: 100,
            max: 10000,
          })
          .toString();
      case 'DECIMAL':
        return this.EN_FAKER.number.float().toString();
      case 'DATE':
        return moment(this.EN_FAKER.date.past()).format('YYYY-MM-DD HH:mm:ss');
      case 'PHONE':
        return this.ZH_FAKER.phone.number();
      case 'STRING':
        return this.EN_FAKER.string.alphanumeric({
          length: { min: 5, max: 10 },
        });
      case 'VEHICLE':
        return this.EN_FAKER.vehicle.vehicle();
      case 'FASH':
        return this.EN_FAKER.animal.fish();
      case 'INSECT':
        return this.EN_FAKER.animal.insect();
      default:
        return '';
    }
  }
}
