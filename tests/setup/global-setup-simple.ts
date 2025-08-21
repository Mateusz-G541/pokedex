import { spawn, ChildProcess } from 'child_process';

declare global {
  // eslint-disable-next-line no-var
  var __SERVER__: ChildProcess;
  // eslint-disable-next-line no-var
  var __FRONTEND__: ChildProcess;
}

async function waitForServer(port: number, maxAttempts: number = 30): Promise<boolean> {
  console.log(`🔍 Waiting for server on port ${port}...`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`📡 Attempt ${attempt}/${maxAttempts}: Checking server...`);

      const response = await fetch(`http://0.0.0.0:${port}/api/health`, {
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
  console.log(`🌐 Environment: NODE_ENV=${process.env.NODE_ENV}`);
  console.log(`🔗 Pokemon API URL: ${pokemonApiUrl}`);
  console.log(`🏥 Health URL: ${healthUrl}`);

  // Additional network debugging
  console.log(`🔍 Network debugging information:`);
  console.log(`- Process platform: ${process.platform}`);
  console.log(`- Process arch: ${process.arch}`);
  console.log(`- Current working directory: ${process.cwd()}`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`📡 Pokemon API check ${attempt}/${maxAttempts}...`);

      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'pokedex-test-setup/1.0',
        },
        signal: AbortSignal.timeout(10000), // Increased to 10 second timeout
      });

      console.log(`📡 Response status: ${response.status}`);
      console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const responseText = await response.text();
        console.log(`📡 Response body:`, responseText);
        console.log(`✅ Pokemon API service is ready!`);
        return true;
      } else {
        const errorText = await response.text().catch(() => 'Could not read response body');
        console.log(`⚠️ Pokemon API responded with status ${response.status}`);
        console.log(`⚠️ Response body: ${errorText}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`❌ Pokemon API connection failed: ${errorMessage}`);

      if (error instanceof Error) {
        console.log(`❌ Error name: ${error.name}`);
        console.log(`❌ Error stack: ${error.stack}`);
      }
    }

    if (attempt < maxAttempts) {
      console.log(`⏳ Waiting 4 seconds before next Pokemon API check...`);
      await new Promise((resolve) => setTimeout(resolve, 4000));
    }
  }

  console.error(`❌ Pokemon API service not available after ${maxAttempts} attempts`);
  return false;
}

async function waitForFrontend(port: number, maxAttempts: number = 30): Promise<boolean> {
  console.log(`🔍 Waiting for frontend on port ${port}...`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`📡 Attempt ${attempt}/${maxAttempts}: Checking frontend...`);

      // Use 127.0.0.1 instead of localhost to avoid IPv6/host mapping differences in CI
      const response = await fetch(`http://127.0.0.1:${port}`, {
        method: 'GET',
        headers: { Accept: 'text/html' },
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });

      if (response.ok) {
        console.log(`✅ Frontend is ready on port ${port}!`);
        return true;
      } else {
        console.log(`⚠️ Frontend responded with status ${response.status}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`❌ Frontend connection failed: ${errorMessage}`);
    }

    if (attempt < maxAttempts) {
      console.log(`⏳ Waiting 2 seconds before next attempt...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.error(`❌ Frontend failed to start after ${maxAttempts} attempts`);
  return false;
}

async function globalSetup() {
  const backendPort = Number(process.env.BACKEND_PORT || 3000);
  const frontendPort = Number(process.env.FRONTEND_PORT || 5173);
  const skipFrontend = (process.env.SKIP_FRONTEND || '').toLowerCase() === 'true';
  const skipBackend = (process.env.SKIP_BACKEND || '').toLowerCase() === 'true';

  // Check if Pokemon API service is available, but don't fail if it's not
  console.log(`🔗 Checking Pokemon API service dependency...`);
  const isPokemonApiReady = await waitForPokemonApiService();

  if (!isPokemonApiReady) {
    console.warn(
      '⚠️ Pokemon API service is not immediately available. Starting pokedex server anyway...',
    );
    console.warn(
      '💡 The pokedex server will handle Pokemon API connectivity issues with timeouts and retries.',
    );
  } else {
    console.log(`✅ Pokemon API service is ready!`);
  }

  // Optionally skip starting backend if requested or already running
  if (skipBackend) {
    console.log(`⏭️  SKIP_BACKEND=true — will not start backend.`);
    console.log(`🔍 Verifying backend health on port ${backendPort}...`);
    const healthy = await waitForServer(backendPort, 3);
    if (!healthy) {
      throw new Error(
        `SKIP_BACKEND is set but backend is not healthy at http://0.0.0.0:${backendPort}/api/health. Start it manually or unset SKIP_BACKEND.`,
      );
    }
  }

  // Start the backend server only if not skipped and not already healthy
  let server: ChildProcess | undefined;
  if (!skipBackend) {
    console.log(`🔍 Checking if backend is already running on port ${backendPort}...`);
    const alreadyHealthy = await waitForServer(backendPort, 1);
    if (alreadyHealthy) {
      console.log('✅ Backend already running — will not spawn a duplicate process.');
    } else {
      console.log(`🚀 Starting pokedex backend server on port ${backendPort}...`);
      server = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        shell: true,
        env: {
          ...process.env,
          PORT: backendPort.toString(),
          NODE_ENV: 'development', // Use development mode for tests
          HOST: '0.0.0.0',
        },
      });

      // Log server output for debugging
      server.stdout?.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          console.log(`📝 Backend: ${output}`);
        }
      });

      server.stderr?.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          console.error(`⚠️ Backend Error: ${output}`);
        }
      });

      server.on('error', (error) => {
        console.error(`❌ Failed to start backend: ${error.message}`);
      });

      // Give server time to fully initialize
      console.log('⏳ Waiting for backend to fully initialize...');
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second delay

      // Wait for backend server to be ready
      const isServerReady = await waitForServer(backendPort);

      if (!isServerReady) {
        console.error('❌ Backend failed to start. Killing process...');
        server.kill('SIGTERM');
        throw new Error('Backend failed to start within the timeout period');
      }

      console.log('🎉 Backend is ready for tests!');
    }
  }

  if (skipFrontend) {
    console.log('⏭️  SKIP_FRONTEND=true — skipping starting the frontend for API-only tests.');
    // Store only backend process for cleanup and return
    if (server) {
      globalThis.__SERVER__ = server;
    }
    return;
  }

  // Start the frontend server (with auto-detect) unless skipped
  let frontend: ChildProcess | undefined;
  console.log(`🔍 Checking if frontend is already running on port ${frontendPort}...`);
  const frontendAlreadyHealthy = await waitForFrontend(frontendPort, 1);
  if (frontendAlreadyHealthy) {
    console.log('✅ Frontend already running — will not spawn a duplicate process.');
  } else {
    console.log(`🚀 Starting frontend server on port ${frontendPort}...`);
    frontend = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      shell: true,
      cwd: './frontend',
      env: {
        ...process.env,
        PORT: frontendPort.toString(),
        NODE_ENV: 'development',
      },
    });

    // Log frontend output for debugging
    frontend.stdout?.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`📝 Frontend: ${output}`);
      }
    });

    frontend.stderr?.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.error(`⚠️ Frontend Error: ${output}`);
      }
    });

    frontend.on('error', (error) => {
      console.error(`❌ Failed to start frontend: ${error.message}`);
    });

    // Give frontend time to fully initialize
    console.log('⏳ Waiting for frontend to fully initialize...');
    await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second delay

    // Wait for frontend to be ready
    const isFrontendReady = await waitForFrontend(frontendPort);

    if (!isFrontendReady) {
      console.error('❌ Frontend failed to start. Killing processes...');
      if (server) server.kill('SIGTERM');
      if (frontend) frontend.kill('SIGTERM');
      throw new Error('Frontend failed to start within the timeout period');
    }
  }

  console.log('🎉 Frontend is ready for tests!');

  // Store processes for cleanup (only if we spawned them)
  if (server) globalThis.__SERVER__ = server;
  if (frontend) globalThis.__FRONTEND__ = frontend;
}

export default globalSetup;
