import app from './app.js';
import { config } from './config/environment.js';
import { testConnection, pool } from './config/database.js';

async function startServer() {
  try {
    console.log('Connecting to Neon PostgreSQL...');
    await testConnection();

    const server = app.listen(config.port, () => {
      console.log('====================================================');
      console.log(`🚀 Sri Murukku Foods ERP Backend Service Active`);
      console.log(`📡 URL: http://localhost:${config.port}`);
      console.log(`🌐 Environment: ${config.nodeEnv}`);
      console.log(`🛡️  DB Schema: ${config.dbSchema}`);
      console.log(`🏥 Health Check: http://localhost:${config.port}/api/health`);
      console.log('====================================================');
    });

    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        try {
          await pool.end();
          console.log('PostgreSQL connection pool closed.');
          process.exit(0);
        } catch (err) {
          console.error('Error closing database pool:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start ERP Server:', error);
    process.exit(1);
  }
}

startServer();
