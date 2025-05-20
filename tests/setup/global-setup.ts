import { spawn, ChildProcess } from 'child_process';

declare global {
  let __SERVER__: ChildProcess;
}

async function globalSetup() {
  // Start the server
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
  });

  // Wait for server to start
  await new Promise((resolve) => {
    server.stdout?.on('data', (data) => {
      if (data.toString().includes('Server is running')) {
        resolve(true);
      }
    });
  });

  // Store server process for cleanup
  global.__SERVER__ = server;
}

export default globalSetup;
