import { ChildProcess } from 'child_process';

declare global {
  let __SERVER__: ChildProcess;
}

async function globalTeardown() {
  // Stop the server
  const server = global.__SERVER__;
  if (server) {
    server.kill();
  }
}

export default globalTeardown;
