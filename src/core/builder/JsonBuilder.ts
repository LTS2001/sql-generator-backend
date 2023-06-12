import { Provide } from '@midwayjs/core';
/**
 * JSON 生成器
 */
@Provide()
export class JsonBuilder {
  buildJson(dataList: Array<Map<string, string>>): string {
    const jsonResultStr = [];
    let obj: object;
    dataList.forEach(data => {
      obj = {};
      for (const [key, value] of data) {
        obj[key] = value;
      }
      jsonResultStr.push(obj);
    });
    return JSON.stringify(jsonResultStr);
  }
}
