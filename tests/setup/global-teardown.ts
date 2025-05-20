async function globalTeardown() {
  // Stop the server
  const server = (global as any).__SERVER__;
  if (server) {
    server.kill();
  }
}

export default globalTeardown;
