// 注册路径别名解析，必须在导入其他模块之前执行
const path = require('path');
const moduleAlias = require('module-alias');

// 注册 @ 别名指向 dist 目录（编译后的代码）
moduleAlias.addAlias('@', path.resolve(__dirname, 'dist'));

const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.run();
