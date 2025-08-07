import { spawn, ChildProcess } from 'child_process';

declare global {
  // eslint-disable-next-line no-var
  var __SERVER__: ChildProcess;
}

async function waitForServer(port: number, maxAttempts: number = 30): Promise<boolean> {
  console.log(`🔍 Waiting for server on port ${port}...`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`📡 Attempt ${attempt}/${maxAttempts}: Checking server...`);

      const response = await fetch(`http://localhost:${port}/api/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });

      if (response.ok) {
        console.log(`✅ Server is ready on port ${port}!`);
        return true;
      } else {
        console.log(`⚠️ Server responded with status ${response.status}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`❌ Connection failed: ${errorMessage}`);
    }

    if (attempt < maxAttempts) {
      console.log(`⏳ Waiting 2 seconds before next attempt...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.error(`❌ Server failed to start after ${maxAttempts} attempts`);
  return false;
}

async function waitForPokemonApiService(maxAttempts: number = 15): Promise<boolean> {
  const pokemonApiUrl = process.env.POKEMON_API_URL || 'http://srv36.mikr.us:20275/api/v2';
  // Extract base URL and construct health endpoint
  const baseUrl = pokemonApiUrl.replace('/api/v2', '');
  const healthUrl = `${baseUrl}/health`;

  console.log(`🔍 Checking Pokemon API service at ${healthUrl}...`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`📡 Pokemon API check ${attempt}/${maxAttempts}...`);

      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (response.ok) {
        console.log(`✅ Pokemon API service is ready!`);
        return true;
      } else {
        console.log(`⚠️ Pokemon API responded with status ${response.status}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`❌ Pokemon API connection failed: ${errorMessage}`);
    }

    if (attempt < maxAttempts) {
      console.log(`⏳ Waiting 4 seconds before next Pokemon API check...`);
      await new Promise((resolve) => setTimeout(resolve, 4000));
    }
  }

  console.error(`❌ Pokemon API service not available after ${maxAttempts} attempts`);
  return false;
}

async function globalSetup() {
  const port = 3000;

  // First, check if Pokemon API service is available (required dependency)
  console.log(`🔗 Checking Pokemon API service dependency...`);
  const isPokemonApiReady = await waitForPokemonApiService();

  if (!isPokemonApiReady) {
    console.error(
      '❌ Pokemon API service is not available. This is required for the pokedex service to function.',
    );
    console.error(
      '💡 In CI/CD, ensure the Pokemon API service container is started and healthy before running tests.',
    );
    throw new Error('Pokemon API service dependency not available');
  }

  console.log(`🚀 Starting pokedex server on port ${port}...`);

  // Start the server
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true,
    env: {
      ...process.env,
      PORT: port.toString(),
      NODE_ENV: 'development', // Use development mode for tests
      HOST: '0.0.0.0',
    },
  });

  // Log server output for debugging
  server.stdout?.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log(`📝 Server: ${output}`);
    }
  });

  server.stderr?.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.error(`⚠️ Server Error: ${output}`);
    }
  });

  server.on('error', (error) => {
    console.error(`❌ Failed to start server: ${error.message}`);
  });

  // Give server time to fully initialize
  console.log('⏳ Waiting for server to fully initialize...');
  await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second delay

  // Wait for server to be ready
  const isServerReady = await waitForServer(port);

  if (!isServerReady) {
    console.error('❌ Server failed to start. Killing process...');
    server.kill('SIGTERM');
    throw new Error('Server failed to start within the timeout period');
  }

  console.log('🎉 Server is ready for tests!');

  // Store server process for cleanup
  globalThis.__SERVER__ = server;
}

export default globalSetup;
