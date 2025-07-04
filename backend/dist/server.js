"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const PORT = env_1.config.port;
const startServer = async () => {
    try {
        // 데이터베이스 연결
        await (0, database_1.connectDatabase)();
        // 서버 시작
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📦 Environment: ${env_1.config.nodeEnv}`);
            console.log(`🌐 API URL: http://localhost:${PORT}/api`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏳ Shutting down gracefully...');
    await (0, database_1.disconnectDatabase)();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n⏳ Shutting down gracefully...');
    await (0, database_1.disconnectDatabase)();
    process.exit(0);
});
startServer();
//# sourceMappingURL=server.js.map