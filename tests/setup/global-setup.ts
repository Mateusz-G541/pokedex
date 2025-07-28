import { spawn, ChildProcess } from 'child_process';
import { setTimeout } from 'timers/promises';

declare global {
  let __SERVER__: ChildProcess;
}

async function waitForServer(port: number, maxAttempts: number): Promise<boolean> {
  let attempts = 0;
  const host = '127.0.0.1';

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`http://${host}:${port}/api/pokemon/types`);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      attempts++;
      await setTimeout(1000);
    }
  }
  return false;
}

async function globalSetup() {
  const port = process.env.PORT || 3000;
  console.log(`Starting server on port ${port}...`);

  // Start the server with explicit host binding
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true,
    env: {
      ...process.env,
      PORT: port.toString(),
      NODE_ENV: 'test',
      HOST: '0.0.0.0', // Bind to all network interfaces
      CUSTOM_POKEMON_API_URL: 'https://pokeapi.co/api/v2', // Use original API for tests
    },
  });

  // Log server output
  server.stdout?.on('data', (data) => {
    console.log(`Server stdout: ${data}`);
  });

  server.stderr?.on('data', (data) => {
    console.error(`Server stderr: ${data}`);
  });

  // Wait for server to start
  const isServerReady = await waitForServer(parseInt(port), 30);

  if (!isServerReady) {
    console.error('Server failed to start. Logs:');
    server.kill();
    throw new Error('Server failed to start within the timeout period');
  }

  console.log('Server is ready!');

  // Store server process for cleanup
  global.__SERVER__ = server;
}

export default globalSetup;
