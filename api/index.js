// 注册路径别名解析，必须在导入其他模块之前执行
const path = require('path');
const moduleAlias = require('module-alias');

// 注册 @ 别名指向 dist 目录（编译后的代码）
moduleAlias.addAlias('@', path.resolve(__dirname, '../dist'));

// 加载环境变量
require('dotenv').config();

const { Bootstrap } = require('@midwayjs/bootstrap');

let app;
let appPromise;

// 初始化 MidwayJS 应用
async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      try {
        const baseDir = path.resolve(__dirname, '../dist');
        
        // 检查 dist 目录是否存在
        const fs = require('fs');
        if (!fs.existsSync(baseDir)) {
          throw new Error(`dist directory not found at ${baseDir}. Current __dirname: ${__dirname}`);
        }
        
        const configPath = path.join(baseDir, 'configuration.js');
        if (!fs.existsSync(configPath)) {
          throw new Error(`configuration.js not found at ${configPath}`);
        }
        
        // 配置 Bootstrap
        Bootstrap.configure({
          baseDir: baseDir,
        });
        
        // 导入配置类
        const configModule = require(configPath);
        const ConfigurationClass = configModule.ContainerLifeCycle;
        
        // 使用 MidwayFrameworkService 来初始化框架
        const { MidwayFrameworkService } = require('@midwayjs/core');
        const frameworkService = new MidwayFrameworkService();
        
        // 创建容器
        const { MidwayContainer } = require('@midwayjs/core');
        const applicationContext = new MidwayContainer(baseDir);
        applicationContext.registerObject('baseDir', baseDir);
        
        // 初始化框架服务
        await frameworkService.init({
          baseDir: baseDir,
          configurationModule: ConfigurationClass,
        });
        
        // 运行框架（但不启动 HTTP 服务器）
        await frameworkService.runFramework(applicationContext);
        
        // 获取主框架
        const framework = frameworkService.getMainFramework();
        
        // 获取 Koa 应用
        app = framework.getApplication();
        
        return app;
      } catch (error) {
        console.error('Error initializing app:', error);
        console.error('Error stack:', error.stack);
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
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
