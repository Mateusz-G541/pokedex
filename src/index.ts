import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import pokemonRoutes from './routes/pokemon.routes';
import pkg from '../package.json';

// Load environnmp ment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || '0.0.0.0';
const isDevelopment = process.env.NODE_ENV === 'development';

// Restore secure CORS configuration
const allowedOrigins = isDevelopment
  ? '*'
  : process.env.ALLOWED_ORIGINS?.split(',') || [
      'https://pokedex-87cl.vercel.app',
      'https://pokedex-n7cs.vercel.app',
    ];

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET'],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: { error: 'Too many requests, please try again later.' },
});

app.use(limiter);
app.use(express.json());

// Serve static images
app.use('/images', express.static(path.join(__dirname, '..', 'images')));

// Service metadata (for health/version responses)
type PackageInfo = { name: string; version: string };
const { name: serviceName, version: serviceVersion } = pkg as PackageInfo;

// Swagger/OpenAPI setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: `${serviceName} API`,
    version: serviceVersion,
    description: 'Pokédex REST API documentation',
  },
  servers: [{ url: `http://${host}:${port}`, description: 'Current server' }],
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    message: { type: 'string' },
                    name: { type: 'string' },
                    version: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/version': {
      get: {
        summary: 'Service version',
        responses: {
          '200': {
            description: 'Version info',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    version: { type: 'string' },
                    env: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [],
});

app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
console.log('🏥 Setting up health check endpoint...');
app.get('/api/health', (req: express.Request, res: express.Response) => {
  console.log('🟢 Health check endpoint called');
  console.log(`📍 Request from: ${req.ip || req.connection.remoteAddress}`);
  console.log(`🌐 Request headers:`, JSON.stringify(req.headers, null, 2));
  console.log(`🔗 Request URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  console.log(`💻 Server listening on: ${host}:${port}`);
  res.status(200).json({
    status: 'ok',
    message: `${serviceName} v${serviceVersion}`,
    name: serviceName,
    version: serviceVersion,
  });
});
console.log('✅ Health check endpoint configured');

// Version endpoint
app.get('/api/version', (_req: express.Request, res: express.Response) => {
  res.status(200).json({
    name: serviceName,
    version: serviceVersion,
    env: process.env.NODE_ENV || 'development',
  });
});

// Routes
console.log('🛣️ Loading Pokemon routes...');
try {
  app.use('/api', pokemonRoutes);
  console.log('✅ Pokemon routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading Pokemon routes:', error);
  throw error;
}

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  const errorMessage = isDevelopment ? err.message : 'Something went wrong!';
  res.status(500).json({ error: errorMessage });
});

// Graceful error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server with error handling
const server = app.listen(port, host, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV || 'development'} mode on ${host}:${port}`,
  );
  console.log(`🏥 Health check available at: http://${host}:${port}/api/health`);
});

// Handle server startup errors
server.on('error', (error: NodeJS.ErrnoException) => {
  console.error('❌ Server startup error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use`);
  }
  process.exit(1);
});
