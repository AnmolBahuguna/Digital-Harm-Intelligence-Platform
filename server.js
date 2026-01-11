import { BackendAPI } from './backend-api.ts';

// Start the enhanced DHIP backend server
const server = new BackendAPI();

const PORT = process.env.PORT || 3001;

server.start(PORT);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});
