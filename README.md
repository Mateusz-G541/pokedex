# Pokédex REST API

A RESTful API for Pokémon data built with Node.js, Express, and TypeScript. This API serves as a proxy to the PokéAPI, providing additional features and a more focused interface.

## Features

- Get Pokémon by type and region
- Get detailed Pokémon information
- Get Pokémon evolution chains
- Compare two Pokémon
- Get all Pokémon types
- Get all regions
- Rate limiting
- CORS enabled
- Security headers with Helmet
- TypeScript support
- API testing with Playwright

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd pokedex-api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:

```
PORT=3000
NODE_ENV=development
POKE_API_BASE_URL=https://pokeapi.co/api/v2
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Development

Start the development server:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Get Pokémon by Type and Region

```
GET /api/pokemon?type=fire&region=kanto
```

### Get Pokémon by Name

```
GET /api/pokemon/:name
```

### Get Pokémon Evolution Chain

```
GET /api/pokemon/:name/evolution
```

### Compare Two Pokémon

```
GET /api/pokemon/compare?first=pikachu&second=raichu
```

### Get All Pokémon Types

```
GET /api/pokemon/types
```

### Get All Regions

```
GET /api/pokemon/regions
```

## Testing

Run the API tests:

```bash
npm test
```

Run specific test file:

```bash
npm run test:api
```

## Building for Production

Build the project:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
