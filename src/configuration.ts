import { App, Configuration, ILifeCycle } from '@midwayjs/core';
import { Application } from 'egg';
import { join } from 'path';
import * as egg from '@midwayjs/web';
import * as view from '@midwayjs/view-ejs';
import * as crossDomain from '@midwayjs/cross-domain';

@Configuration({
  imports: [egg, view, crossDomain],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle implements ILifeCycle {
  @App()
  app: Application;

  async onReady() {}
}
