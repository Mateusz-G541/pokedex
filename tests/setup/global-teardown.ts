import { ChildProcess } from 'child_process';

declare global {
  var __SERVER__: ChildProcess;
}

async function globalTeardown() {
  console.log('🧹 Cleaning up test server...');
  
  // Stop the server
  const server = globalThis.__SERVER__;
  if (server && !server.killed) {
    console.log('🛑 Stopping server process...');
    server.kill('SIGTERM');
    
    // Wait a bit for graceful shutdown
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Force kill if still running
    if (!server.killed) {
      console.log('⚡ Force killing server process...');
      server.kill('SIGKILL');
    }
    
    console.log('✅ Server cleanup completed');
  } else {
    console.log('ℹ️ No server process to clean up');
  }
}

export default globalTeardown;
