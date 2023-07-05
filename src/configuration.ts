import {
  App,
  Configuration,
  ILifeCycle,
  IMidwayApplication,
} from '@midwayjs/core';
import { join } from 'path';
import * as egg from '@midwayjs/web';
import * as view from '@midwayjs/view-ejs';
import * as crossDomain from '@midwayjs/cross-domain';
import * as sequelize from '@midwayjs/sequelize';
import * as upload from '@midwayjs/upload';
import * as validate from '@midwayjs/validate';
import * as jwt from '@midwayjs/jwt';

import { GlobalExceptionHandler } from './exception/GlobalExceptionHandler';
import { GlobalMiddleware } from './middleware/global.middleware';

@Configuration({
  imports: [egg, view, crossDomain, sequelize, upload, validate, jwt],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle implements ILifeCycle {
  @App()
  app: IMidwayApplication;

  async onReady() {
    this.app.useFilter([GlobalExceptionHandler]);
    this.app.useMiddleware([GlobalMiddleware]);
  }
}
