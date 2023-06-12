import { Controller, Post, Body, Inject } from '@midwayjs/core';
import { GenerateFacade } from '@/core/GeneratorFacade';

@Controller('/sql')
export class SqlController {
  @Inject()
  private generatorFacade: GenerateFacade;
  @Post('/generate/schema')
  async generateBySchema(@Body() tableSchema: TableSchema): Promise<any> {
    try {
      return this.generatorFacade.generateAll(tableSchema);
    } catch (error) {
      return error.message;
    }
  }
}
