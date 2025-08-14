#!/usr/bin/env node

/**
 * CI/CD Setup Script
 *
 * This script automates the entire test setup process:
 * 1. Install dependencies
 * 2. Start backend server with health checks
 * 3. Start frontend (optional)
 * 4. Verify services are running with curl
 * 5. Run tests
 *
 * Usage:
 *   node scripts/ci-setup.js [--frontend] [--tests-only]
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  BACKEND_PORT: process.env.PORT || 3000,
  FRONTEND_PORT: process.env.FRONTEND_PORT || 3001,
  HEALTH_CHECK_TIMEOUT: 60000, // 60 seconds
  HEALTH_CHECK_INTERVAL: 2000, // 2 seconds
  MAX_RETRIES: 30,
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n🚀 Step ${step}: ${message}`, colors.bright + colors.blue);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Utility function to run shell commands
function runCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    log(`Running: ${command}`, colors.cyan);

    const child = spawn(command, [], {
      shell: true,
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });

    let stdout = '';
    let stderr = '';

    if (child.stdout) {
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });

    // Store process for cleanup
    if (options.keepAlive) {
      return child;
    }
  });
}

// Health check function
async function healthCheck(url, maxRetries = CONFIG.MAX_RETRIES) {
  log(`Checking health: ${url}`, colors.cyan);

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        logSuccess(`Service is healthy: ${url}`);
        return true;
      }
    } catch (error) {
      // Service not ready yet
    }

    log(`Attempt ${i + 1}/${maxRetries} - waiting...`, colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, CONFIG.HEALTH_CHECK_INTERVAL));
  }

  logError(`Health check failed after ${maxRetries} attempts: ${url}`);
  return false;
}

// Kill process on port
async function killPort(port) {
  try {
    if (process.platform === 'win32') {
      await runCommand(`netstat -ano | findstr :${port}`, { silent: true });
      await runCommand(
        `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /F /PID %a`,
        { silent: true },
      );
    } else {
      await runCommand(`lsof -ti:${port} | xargs kill -9`, { silent: true });
    }
    logSuccess(`Killed processes on port ${port}`);
  } catch (error) {
    // Port might not be in use, which is fine
    log(`No processes found on port ${port}`, colors.yellow);
  }
}

// Main setup function
async function setupAndRun() {
  const args = process.argv.slice(2);
  const includeFrontend = args.includes('--frontend');
  const testsOnly = args.includes('--tests-only');

  log('🎮 Pokemon App CI/CD Setup Script', colors.bright + colors.magenta);
  log('=====================================', colors.magenta);

  const processes = [];

  try {
    if (!testsOnly) {
      // Step 1: Install dependencies
      logStep(1, 'Installing dependencies');
      await runCommand('npm install');
      logSuccess('Dependencies installed');

      // Step 2: Clean up any existing processes
      logStep(2, 'Cleaning up existing processes');
      await killPort(CONFIG.BACKEND_PORT);
      if (includeFrontend) {
        await killPort(CONFIG.FRONTEND_PORT);
      }

      // Step 3: Start backend server
      logStep(3, 'Starting backend server');
      log(`Starting backend on port ${CONFIG.BACKEND_PORT}...`, colors.cyan);

      const backendProcess = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        shell: true,
        env: {
          ...process.env,
          PORT: CONFIG.BACKEND_PORT,
          NODE_ENV: 'test',
          CUSTOM_POKEMON_API_URL: 'https://pokeapi.co/api/v2', // Use official API for tests
        },
      });

      // Log backend output
      backendProcess.stdout.on('data', (data) => {
        log(`[Backend] ${data.toString().trim()}`, colors.blue);
      });

      backendProcess.stderr.on('data', (data) => {
        log(`[Backend Error] ${data.toString().trim()}`, colors.red);
      });

      processes.push({ name: 'Backend', process: backendProcess });

      // Step 4: Wait for backend to be ready
      logStep(4, 'Waiting for backend to be ready');
      const backendHealthy = await healthCheck(
        `http://localhost:${CONFIG.BACKEND_PORT}/api/pokemon/types`,
      );

      if (!backendHealthy) {
        throw new Error('Backend failed to start');
      }

      // Step 5: Verify backend with curl
      logStep(5, 'Verifying backend with curl');
      try {
        const curlResult = await runCommand(
          `curl -f http://localhost:${CONFIG.BACKEND_PORT}/api/pokemon/1`,
          { silent: true },
        );
        logSuccess('Backend API is responding correctly');
        log('Sample response received', colors.green);
      } catch (error) {
        logWarning('Curl test failed, but continuing...');
      }

      // Step 6: Start frontend (if requested)
      if (includeFrontend) {
        logStep(6, 'Starting frontend');
        log(`Starting frontend on port ${CONFIG.FRONTEND_PORT}...`, colors.cyan);

        const frontendProcess = spawn('npm', ['run', 'dev'], {
          stdio: 'pipe',
          shell: true,
          cwd: path.join(__dirname, '..', 'frontend'),
          env: {
            ...process.env,
            PORT: CONFIG.FRONTEND_PORT,
            REACT_APP_API_URL: `http://localhost:${CONFIG.BACKEND_PORT}`,
          },
        });

        frontendProcess.stdout.on('data', (data) => {
          log(`[Frontend] ${data.toString().trim()}`, colors.magenta);
        });

        frontendProcess.stderr.on('data', (data) => {
          log(`[Frontend Error] ${data.toString().trim()}`, colors.red);
        });

        processes.push({ name: 'Frontend', process: frontendProcess });

        // Wait for frontend to be ready
        const frontendHealthy = await healthCheck(`http://localhost:${CONFIG.FRONTEND_PORT}`);

        if (!frontendHealthy) {
          logWarning('Frontend health check failed, but continuing...');
        }
      }
    }

    // Step 7: Run tests
    const testStep = testsOnly ? 1 : includeFrontend ? 7 : 6;
    logStep(testStep, 'Running Playwright tests');

    // Set environment variable to skip auto-start since we already started the server
    process.env.PLAYWRIGHT_AUTO_START_SERVER = 'false';

    await runCommand('npm run test');
    logSuccess('All tests completed successfully!');
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  } finally {
    // Cleanup: Kill all spawned processes
    log('\n🧹 Cleaning up processes...', colors.yellow);

    for (const { name, process } of processes) {
      if (process && !process.killed) {
        log(`Killing ${name} process...`, colors.yellow);
        process.kill('SIGTERM');

        // Force kill after 5 seconds if still running
        setTimeout(() => {
          if (!process.killed) {
            process.kill('SIGKILL');
          }
        }, 5000);
      }
    }

    logSuccess('Cleanup completed');
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n🛑 Received SIGINT, cleaning up...', colors.yellow);
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n🛑 Received SIGTERM, cleaning up...', colors.yellow);
  process.exit(0);
});

// Run the setup
if (require.main === module) {
  setupAndRun().catch((error) => {
    logError(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { setupAndRun, healthCheck, killPort };
