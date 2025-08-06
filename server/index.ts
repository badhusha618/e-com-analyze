// Simple server to serve the Vite frontend
import { createServer } from 'vite';
import path from 'path';

async function startServer() {
  const server = await createServer({
    server: {
      port: 5000,
      host: '0.0.0.0',
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
      allowedHosts: [
        "dae825ce-6741-4128-b456-42bc8a81c10c-00-2mn6e8zmomfe3.picard.replit.dev",
      ],
    },
    root: path.resolve(process.cwd(), 'client'),
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "client", "src"),
        "@shared": path.resolve(process.cwd(), "shared"),
        "@assets": path.resolve(process.cwd(), "attached_assets"),
      },
    },
  });
  
  await server.listen();
  console.log(`🚀 Frontend server running on http://0.0.0.0:5000`);
  console.log(`🔗 Connect to Spring Boot backend at http://localhost:8080`);
}

startServer().catch(console.error);