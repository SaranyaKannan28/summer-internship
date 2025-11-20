import http from 'http';
import dotenv from 'dotenv';
import { requestHandler } from './app.js';
import { initModels } from './models/index.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Start server
const startServer = async () => {
  try {
    // Initialize database and models
    console.log('🔄 Initializing database...');
    await initModels();
    
    // Create HTTP server
    const server = http.createServer(requestHandler);

    // Start listening
    server.listen(PORT, HOST, () => {
      console.log('\n╔════════════════════════════════════════════════╗');
      console.log('║   💰 Salary Management System                 ║');
      console.log('╠════════════════════════════════════════════════╣');
      console.log(`║   🚀 Server running on:                        ║`);
      console.log(`║      http://localhost:${PORT}                  ║`);
      console.log('║                                                ║');
      console.log('║   📡 AUTH Endpoints:                           ║');
      console.log(`║      POST   /api/auth/signup                   ║`);
      console.log(`║      POST   /api/auth/login                    ║`);
      console.log('║                                                ║');
      console.log('║   📡 Salary API:                               ║');
      console.log(`║      POST   /api/salaries                      ║`);
      console.log(`║      GET    /api/salaries                      ║`);
      console.log(`║      GET    /api/salaries/:id                  ║`);
      console.log(`║      PUT    /api/salaries/:id                  ║`);
      console.log(`║      DELETE /api/salaries/:id                  ║`);
      console.log('║                                                ║');
      console.log('║   📄 Web Pages:                                ║');
      console.log(`║      /                                          ║`);
      console.log(`║      /login.html                                ║`);
      console.log(`║      /signup.html                               ║`);
      console.log('╚════════════════════════════════════════════════╝\n');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n🛑 SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n🛑 SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
