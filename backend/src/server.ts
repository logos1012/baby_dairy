import app from './app';
import { config } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';

const PORT = config.port;

const startServer = async () => {
  try {
    // 데이터베이스 연결
    await connectDatabase();
    
    // 서버 시작
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📦 Environment: ${config.nodeEnv}`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏳ Shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏳ Shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

startServer();