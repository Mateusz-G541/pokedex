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

// Cross-platform: kill any process listening on a given TCP port
async function killProcessOnPort(port: number): Promise<void> {
  console.log(`🛑 Ensuring no process is listening on port ${port} before starting frontend...`);

  const run = (cmd: string, args: string[], cwd?: string) =>
    new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve) => {
      const child = spawn(cmd, args, { shell: true, cwd });
      let stdout = '';
      let stderr = '';
      child.stdout?.on('data', (d) => (stdout += d.toString()));
      child.stderr?.on('data', (d) => (stderr += d.toString()));
      child.on('close', (code) => resolve({ code, stdout, stderr }));
      child.on('error', () => resolve({ code: 1, stdout, stderr }));
    });

  try {
    if (process.platform === 'win32') {
      // Find PIDs listening on the port via netstat
      const { stdout } = await run('cmd.exe', ['/c', `netstat -ano | findstr :${port}`]);
      const pids = Array.from(
        new Set(
          stdout
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter((l) => l && /LISTENING/i.test(l))
            .map((l) => l.split(/\s+/).pop()!)
            .filter((pid) => /^\d+$/.test(pid)),
        ),
      );

      if (pids.length === 0) {
        console.log(`✅ No existing process found on port ${port}.`);
        return;
      }

      console.log(`⚠️ Found ${pids.length} process(es) on port ${port}: ${pids.join(', ')}`);
      for (const pid of pids) {
        const res = await run('taskkill', ['/PID', pid, '/F']);
        if (res.code === 0) {
          console.log(`✅ Killed PID ${pid} on port ${port}.`);
        } else {
          console.warn(`⚠️ Failed to kill PID ${pid}. stderr: ${res.stderr || res.stdout}`);
        }
      }
    } else {
      // macOS/Linux
      const { stdout } = await run('bash', ['-lc', `lsof -ti tcp:${port} || true`]);
      const pids = stdout
        .split(/\s+/)
        .map((s) => s.trim())
        .filter((s) => /^\d+$/.test(s));

      if (pids.length === 0) {
        console.log(`✅ No existing process found on port ${port}.`);
        return;
      }

      console.log(`⚠️ Found ${pids.length} process(es) on port ${port}: ${pids.join(', ')}`);
      await run('bash', ['-lc', `kill -9 ${pids.join(' ')}`]);
      console.log(`✅ Killed processes on port ${port}.`);
    }
  } catch (err) {
    console.warn(`⚠️ Error during port cleanup for ${port}:`, err);
  }
}

async function globalSetup() {
  console.log('🟢 Using global-setup-simple (NO FRONTEND WAITS)');
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

  // Start the frontend server without any waiting or health checks
  // We will spawn a new frontend process below and store it for cleanup
  // Kill any stale process that might still be holding the Vite port
  await killProcessOnPort(frontendPort);
  console.log(`🚀 Starting frontend server on fixed port ${frontendPort} (no checks, strict)...`);
  const spawnedFrontend = spawn(
    'npm',
    ['run', 'dev', '--', '--port', String(frontendPort), '--strictPort'],
    {
      stdio: 'pipe',
      shell: true,
      cwd: './frontend',
      env: {
        ...process.env,
        PORT: frontendPort.toString(),
      },
    },
  );

  // Stream output for debugging, but do not block or enforce readiness
  spawnedFrontend.stdout?.on('data', (data: Buffer) => {
    const line = data.toString();
    process.stdout.write(`📝 Frontend: ${line}`);
  });
  spawnedFrontend.stderr?.on('data', (data: Buffer) => {
    const line = data.toString();
    process.stderr.write(`📝 Frontend: ${line}`);
  });

  console.log('ℹ️ Frontend spawn initiated (no readiness checks). Proceeding with tests.');

  // Store processes for cleanup (only if we spawned them)
  if (server) globalThis.__SERVER__ = server;
  if (spawnedFrontend) globalThis.__FRONTEND__ = spawnedFrontend;
}

export default globalSetup;
