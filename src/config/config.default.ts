import { MidwayConfig, MidwayAppInfo } from '@midwayjs/core';
import { tmpdir } from 'os';
import { join } from 'path';

import { Dict } from '@/model/entitys/dict';
import { FieldInfo } from '@/model/entitys/fieldInfo';
import { Report } from '@/model/entitys/report';
import { TableInfo } from '@/model/entitys/tableInfo';
import { User } from '@/model/entitys/user';

export default (appInfo: MidwayAppInfo) => {
  return {
    // use for cookie sign key, should change to your own and keep security
    keys: appInfo.name + '_1685925799840_7086',
    egg: {
      port: 7001,
    },
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
    cors: {
      credentials: true,
    },
    sequelize: {
      dataSource: {
        default: {
          database: 'sqlfather',
          username: 'root',
          password: 'root',
          host: '127.0.0.1',
          port: 3306,
          encrypt: false,
          dialect: 'mysql',
          define: { charset: 'utf8' },
          timezone: '+08:00',
          entities: [Dict, FieldInfo, Report, TableInfo, User],
          // 本地的时候，可以通过 sync: true 直接 createTable
          sync: false,
        },
      },
    },
    upload: {
      mode: 'file',
      // whitelist: string[]，文件扩展名白名单
      whitelist: null,
      // tmpdir: string，上传的文件临时存储路径
      tmpdir: join(tmpdir(), 'midway-upload-files'),
      // cleanTimeout: number，上传的文件在临时目录中多久之后自动删除，默认为 5 分钟
      cleanTimeout: 5 * 60 * 1000,
      // 仅在匹配路径到 /sql/get/schema/excel 的时候去解析 body 中的文件信息
      match: /\/sql\/get\/schema\/excel/,
    },
    jwt: {
      secret: 'my name is litaosheng',
      expiresIn: '1d',
    },
  } as MidwayConfig;
};
