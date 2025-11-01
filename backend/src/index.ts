/**
 * Express 应用主入口
 * 初始化 Express 应用并注册所有路由
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 导入路由
import authRoutes from './routes/auth.routes';
import tenantRoutes from './routes/tenant.routes';
import userRoutes from './routes/user.routes';
import instanceRoutes from './routes/instance.routes';
import placeRoutes from './routes/place.routes';
import vpcRoutes from './routes/vpc.routes';
import subnetRoutes from './routes/subnet.routes';
import templateRoutes from './routes/template.routes';

// 创建 Express 应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(helmet()); // 安全头
app.use(cors()); // 跨域支持
app.use(express.json()); // JSON 解析
app.use(express.urlencoded({ extended: true })); // URL 编码解析

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API 路由注册
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tenants', tenantRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/instances', instanceRoutes);
app.use('/api/v1/places', placeRoutes);
app.use('/api/v1/vpcs', vpcRoutes);
app.use('/api/v1/subnets', subnetRoutes);
app.use('/api/v1/templates', templateRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: 'Route not found',
    data: null,
  });
});

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    code: 500,
    message: err.message || 'Internal server error',
    data: null,
  });
});

// 启动服务器
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1`);
  });
}

export default app;

