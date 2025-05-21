import { ChildProcess } from 'child_process';

// Store server process
let serverProcess: ChildProcess | undefined;

async function globalTeardown() {
  if (serverProcess) {
    console.log('Shutting down server...');
    serverProcess.kill();
    serverProcess = undefined;
  }
}

export default globalTeardown;
