// 注册路径别名解析，必须在导入其他模块之前执行
const path = require('path');
const moduleAlias = require('module-alias');

// 注册 @ 别名指向 dist 目录（编译后的代码）
moduleAlias.addAlias('@', path.resolve(__dirname, '../dist'));

const { Bootstrap } = require('@midwayjs/bootstrap');

let app;
let appPromise;

// 初始化 MidwayJS 应用
async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      // 设置环境变量（Vercel Serverless 环境）
      process.env.NODE_ENV = process.env.NODE_ENV || 'production';
      
      // 使用 Bootstrap 启动应用
      const applicationContext = await Bootstrap.start({
        baseDir: path.resolve(__dirname, '../dist'),
        framework: require('@midwayjs/web'),
      });
      
      // 获取 Koa 应用实例
      const { Framework } = require('@midwayjs/web');
      const framework = await applicationContext.getAsync(Framework);
      app = framework.getApplication();
      
      return app;
    })();
  }
  return appPromise;
}

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
  try {
    // 获取 Koa 应用实例
    const koaApp = await getApp();
    
    // 将 Vercel 的 req/res 转换为 Koa 中间件格式
    return new Promise((resolve, reject) => {
      // 使用 Koa 的 callback 方法处理请求
      const handleRequest = koaApp.callback();
      
      handleRequest(req, res, (err) => {
        if (err) {
          console.error('Request error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Error initializing app:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
};
