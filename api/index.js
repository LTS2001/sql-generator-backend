// 注册路径别名解析，必须在导入其他模块之前执行
const path = require('path');
const moduleAlias = require('module-alias');

// 注册 @ 别名指向 dist 目录（编译后的代码）
moduleAlias.addAlias('@', path.resolve(__dirname, '../dist'));

// 加载环境变量
require('dotenv').config();

// 设置 serverless 模式，阻止 Bootstrap.run() 启动 HTTP 服务器
process.env.SERVERLESS = 'true';

const { Bootstrap } = require('@midwayjs/bootstrap');

let app;
let appPromise;

// 初始化 MidwayJS 应用
async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      try {
        const baseDir = path.resolve(__dirname, '../dist');
        
        // 配置 Bootstrap
        Bootstrap.configure({
          baseDir: baseDir,
        });
        
        // 由于 MidwayJS Bootstrap 的设计，我们需要通过框架来初始化
        // 尝试直接使用框架服务
        const { MidwayFrameworkService } = require('@midwayjs/core');
        const frameworkService = new MidwayFrameworkService();
        
        // 导入配置类
        const configModule = require(path.join(baseDir, 'configuration.js'));
        const ConfigurationClass = configModule.ContainerLifeCycle;
        
        // 创建容器
        const { MidwayContainer } = require('@midwayjs/core');
        const applicationContext = new MidwayContainer(baseDir);
        applicationContext.registerObject('baseDir', baseDir);
        
        // 加载框架配置
        await frameworkService.loadFramework(applicationContext, {
          Configuration: ConfigurationClass,
        });
        
        // 获取 Koa Framework
        const { Framework } = require('@midwayjs/web');
        const framework = await applicationContext.getAsync(Framework);
        app = framework.getApplication();
        
        return app;
      } catch (error) {
        console.error('Error initializing app:', error);
        throw error;
      }
    })();
  }
  return appPromise;
}

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
  try {
    const koaApp = await getApp();
    
    // 将 Vercel 的 req/res 转换为 Koa 中间件格式
    return new Promise((resolve, reject) => {
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
    console.error('Error in handler:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message
    });
  }
};
