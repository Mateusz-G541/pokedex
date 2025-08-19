import { ChildProcess } from 'child_process';

declare global {
  // eslint-disable-next-line no-var
  var __SERVER__: ChildProcess;
  // eslint-disable-next-line no-var
  var __FRONTEND__: ChildProcess;
}

async function globalTeardown() {
  console.log('🧹 Cleaning up test servers...');

  // Stop the backend server
  const server = globalThis.__SERVER__;
  if (server && !server.killed) {
    console.log('🛑 Stopping backend server process...');
    server.kill('SIGTERM');

    // Wait a bit for graceful shutdown
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Force kill if still running
    if (!server.killed) {
      console.log('⚡ Force killing backend server process...');
      server.kill('SIGKILL');
    }

    console.log('✅ Backend server cleanup completed');
  } else {
    console.log('ℹ️ No backend server process to clean up');
  }

  // Stop the frontend server
  const frontend = globalThis.__FRONTEND__;
  if (frontend && !frontend.killed) {
    console.log('🛑 Stopping frontend server process...');
    frontend.kill('SIGTERM');

    // Wait a bit for graceful shutdown
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Force kill if still running
    if (!frontend.killed) {
      console.log('⚡ Force killing frontend server process...');
      frontend.kill('SIGKILL');
    }

    console.log('✅ Frontend server cleanup completed');
  } else {
    console.log('ℹ️ No frontend server process to clean up');
  }
}

export default globalTeardown;
