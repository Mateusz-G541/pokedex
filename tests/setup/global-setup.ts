import { spawn, ChildProcess } from 'child_process';
import { setTimeout } from 'timers/promises';

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
  let isServerReady = false;
  const maxAttempts = 30; // 30 seconds timeout
  let attempts = 0;

  while (!isServerReady && attempts < maxAttempts) {
    try {
      const response = await fetch('http://localhost:3000/api/pokemon/types');
      if (response.ok) {
        isServerReady = true;
        console.log('Server is ready!');
      }
    } catch (error) {
      attempts++;
      await setTimeout(1000); // Wait 1 second between attempts
    }
  }

  if (!isServerReady) {
    throw new Error('Server failed to start within the timeout period');
  }

  // Store server process for cleanup
  global.__SERVER__ = server;
}

export default globalSetup;
