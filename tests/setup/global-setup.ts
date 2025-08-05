import { spawn, ChildProcess } from 'child_process';
import { setTimeout } from 'timers/promises';

declare global {
  let __SERVER__: ChildProcess;
}

async function waitForServer(port: number, maxAttempts: number): Promise<boolean> {
  let attempts = 0;
  const host = '127.0.0.1';
  const healthEndpoints = [
    `/api/pokemon/types`,
    `/api/pokemon/1`,
    `/api/health`,
    `/` // Fallback to root
  ];

  console.log(`Waiting for server at http://${host}:${port}...`);

  while (attempts < maxAttempts) {
    for (const endpoint of healthEndpoints) {
      try {
        console.log(`Attempt ${attempts + 1}/${maxAttempts}: Checking ${endpoint}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout per request
        
        const response = await fetch(`http://${host}:${port}${endpoint}`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✅ Server is ready! Responded to ${endpoint}`);
          return true;
        } else {
          console.log(`⚠️ Server responded with status ${response.status} for ${endpoint}`);
        }
      } catch (error: any) {
        console.log(`❌ Failed to connect to ${endpoint}: ${error.message}`);
        // Continue to next endpoint
      }
    }
    
    attempts++;
    if (attempts < maxAttempts) {
      console.log(`Waiting 2 seconds before next attempt...`);
      await setTimeout(2000);
    }
  }
  
  console.error(`❌ Server failed to respond to any health check after ${maxAttempts} attempts`);
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
  const isServerReady = await waitForServer(parseInt(port.toString()), 30);

  if (!isServerReady) {
    console.error('Server failed to start. Logs:');
    server.kill();
    throw new Error('Server failed to start within the timeout period');
  }

  console.log('Server is ready!');

  // Store server process for cleanup
  (global as any).__SERVER__ = server;
}

export default globalSetup;
