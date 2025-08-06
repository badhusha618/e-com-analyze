// Simple server to serve the Vite frontend
import { createServer } from 'vite';

async function startServer() {
  const server = await createServer({
    server: {
      port: 5000,
      host: '0.0.0.0'
    },
    root: './client',
  });
  
  await server.listen();
  console.log(`🚀 Frontend server running on http://0.0.0.0:5000`);
  console.log(`🔗 Connect to Spring Boot backend at http://localhost:8080`);
}

startServer().catch(console.error);