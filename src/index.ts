import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import pokemonRoutes from './routes/pokemon.routes';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';
const isDevelopment = process.env.NODE_ENV === 'development';

// Middleware
app.use(
  cors({
    origin: isDevelopment ? '*' : process.env.ALLOWED_ORIGINS?.split(',') || [],
    methods: ['GET'],
    credentials: true,
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

// Routes
app.use('/api', pokemonRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  const errorMessage = isDevelopment ? err.message : 'Something went wrong!';
  res.status(500).json({ error: errorMessage });
});

// Start server
app.listen(port, host, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV || 'development'} mode on ${host}:${port}`,
  );
});
