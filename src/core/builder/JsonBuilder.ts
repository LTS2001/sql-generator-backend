import { Inject, Provide } from '@midwayjs/core';
import { Context } from '@midwayjs/web';
/**
 * JSON 生成器
 */
@Provide()
export class JsonBuilder {
  @Inject()
  ctx: Context;

  async buildJson(dataList: Array<object>): Promise<string> {
    return await this.ctx.renderView('jsonData', { dataList });
  }
}
