import { spawn } from 'child_process';

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
  (global as any).__SERVER__ = server;
}

export default globalSetup;
