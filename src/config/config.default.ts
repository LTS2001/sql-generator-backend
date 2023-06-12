import { MidwayConfig, MidwayAppInfo } from '@midwayjs/core';
import { join } from 'path';

export default (appInfo: MidwayAppInfo) => {
  return {
    // use for cookie sign key, should change to your own and keep security
    keys: appInfo.name + '_1685925799840_7086',
    egg: {
      port: 7001,
    },
    // security: {
    //   csrf: false,
    // },
    paths: {
      '@/*': ['src/*'],
    },
    view: {
      // 配置后缀，渲染时可不加后缀
      defaultExtension: '.ejs',
      // 默认引擎
      defaultViewEngine: 'ejs',
      mapping: {
        '.ejs': 'ejs',
      },
      // 修改默认 view 组件的 default 目录
      rootDir: {
        default: join(__dirname, '../templates'),
      },
    },
    ejs: {},
    cors: {
      credentials: false,
    },
  } as MidwayConfig;
};
