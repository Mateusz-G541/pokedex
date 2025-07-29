import { test, expect } from '@playwright/test';

interface PokemonResponse {
  name: string;
  id: number;
  types: Array<{ type: { name: string } }>;
  sprites: {
    front_default: string;
  };
}

interface PokemonType {
  type: {
    name: string;
  };
}

test.describe('Pokemon API', () => {
  test('GET /api/pokemon?type=fire&region=kanto returns Pokemon with correct type and region', async ({
    request,
  }) => {
    const response = await request.get('/api/pokemon?type=fire&region=kanto');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);
    data.forEach((pokemon) => {
      expect(pokemon.types.some((t: PokemonType) => t.type.name === 'fire')).toBeTruthy();
      expect(pokemon.id).toBeGreaterThanOrEqual(1);
      expect(pokemon.id).toBeLessThanOrEqual(151);
    });
  });

  test('GET /api/pokemon/:name returns Pokemon details', async ({ request }) => {
    const response = await request.get('/api/pokemon/pikachu');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.name).toBe('pikachu');
    expect(data.types).toBeDefined();
    expect(data.stats).toBeDefined();
    expect(data.abilities).toBeDefined();
    expect(data.sprites).toBeDefined();
  });

  test('GET /api/pokemon/:name/evolution returns evolution chain', async ({ request }) => {
    const response = await request.get('/api/pokemon/pikachu/evolution');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.species).toBeDefined();
    expect(data.evolves_to).toBeDefined();
  });

  test('GET /api/pokemon/compare compares two Pokemon', async ({ request }) => {
    const response = await request.get('/api/pokemon/compare?first=pikachu&second=raichu');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('first');
    expect(data).toHaveProperty('second');
    expect(data).toHaveProperty('differences');
    expect(data.first.name).toBe('pikachu');
    expect(data.second.name).toBe('raichu');
    expect(typeof data.differences.hp).toBe('number');
  });

  test('GET /api/pokemon/types returns all Pokemon types', async ({ request }) => {
    const response = await request.get('/api/pokemon/types');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);
    const commonTypes = ['fire', 'water', 'grass', 'electric', 'normal'];
    commonTypes.forEach((type) => {
      expect(data).toContain(type);
    });
  });

  test('GET /api/pokemon/regions returns all regions', async ({ request }) => {
    const response = await request.get('/api/pokemon/regions');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);

    const firstRegion = data[0];
    expect(firstRegion).toHaveProperty('name');
    expect(firstRegion).toHaveProperty('generation');
    expect(firstRegion).toHaveProperty('pokemonRange');
    expect(firstRegion.pokemonRange).toHaveProperty('start');
    expect(firstRegion.pokemonRange).toHaveProperty('end');
  });

  test('GET /api/pokemon with invalid parameters returns 400', async ({ request }) => {
    const response = await request.get('/api/pokemon');
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('GET /api/pokemon/compare with missing parameters returns 400', async ({ request }) => {
    const response = await request.get('/api/pokemon/compare');
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('GET /api/pokemon/nonexistent returns 404', async ({ request }) => {
    const response = await request.get('/api/pokemon/nonexistent');
    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('GET /api/pokemon/random-legendary returns Pokemon details', async ({ request }) => {
    const response = await request.get('/api/pokemon/random/legendary');
    expect(response.ok()).toBeTruthy();
    const data = (await response.json()) as PokemonResponse;

    // Verify basic Pokemon structure
    expect(data.name).toBeDefined();
    expect(data.id).toBeDefined();
    expect(data.types).toBeDefined();
    expect(data.sprites).toBeDefined();

    // Verify that the Pokemon is legendary
    const legendaryIds = [
      144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380, 381, 382, 383, 384,
      385, 386, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 643, 644,
      646, 716, 717, 718, 719, 720, 721, 785, 786, 787, 788, 789, 790, 791, 792, 793, 794, 795, 796,
      797, 798, 799, 800, 801, 802, 888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898,
    ];
    expect(legendaryIds).toContain(data.id);
  });
});

// Mikr.us Custom Pokemon API Integration Tests
test.describe('Mikr.us Pokemon API Integration', () => {
  const MIKRUS_API_BASE = 'http://srv36.mikr.us:20275/api/v2';
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

  test.beforeEach(async () => {
    // Skip tests in CI environments where Mikr.us server isn't accessible
    test.skip(isCI, 'Skipping Mikr.us integration tests in CI environment');
  });

  test('GET /pokemon/:id from Mikr.us API returns Pokemon data', async ({ request }) => {
    const response = await request.get(`${MIKRUS_API_BASE}/pokemon/25`); // Pikachu
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.name).toBe('pikachu');
    expect(data.id).toBe(25);
    expect(data.types).toBeDefined();
    expect(data.sprites).toBeDefined();
    expect(data.sprites.front_default).toContain('srv36.mikr.us:20275'); // Verify local image URLs
  });

  test('GET /pokemon/:name from Mikr.us API returns Pokemon data', async ({ request }) => {
    const response = await request.get(`${MIKRUS_API_BASE}/pokemon/charizard`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.name).toBe('charizard');
    expect(data.id).toBe(6);
    expect(data.types).toBeDefined();
    expect(data.types.some((t: PokemonType) => t.type.name === 'fire')).toBeTruthy();
    expect(data.sprites.front_default).toContain('srv36.mikr.us:20275');
  });

  test('GET /pokemon?limit=151 from Mikr.us API returns Generation 1 Pokemon list', async ({
    request,
  }) => {
    const response = await request.get(`${MIKRUS_API_BASE}/pokemon?limit=151`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.results).toBeDefined();
    expect(data.results.length).toBe(151);
    expect(data.count).toBe(151);

    // Verify first and last Pokemon
    expect(data.results[0].name).toBe('bulbasaur');
    expect(data.results[150].name).toBe('mew');

    // Verify URLs point to Mikr.us
    expect(data.results[0].url).toContain('srv36.mikr.us:20275');
  });

  test('GET /pokemon-species/:id from Mikr.us API returns species data', async ({ request }) => {
    const response = await request.get(`${MIKRUS_API_BASE}/pokemon-species/1`); // Bulbasaur
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.name).toBe('bulbasaur');
    expect(data.id).toBe(1);
    expect(data.evolution_chain).toBeDefined();
    expect(data.evolution_chain.url).toContain('srv36.mikr.us:20275');
  });

  test('GET /evolution-chain/:id from Mikr.us API returns evolution data', async ({ request }) => {
    const response = await request.get(`${MIKRUS_API_BASE}/evolution-chain/1`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.chain).toBeDefined();
    expect(data.chain.species).toBeDefined();
    expect(data.chain.species.name).toBe('bulbasaur');
  });

  test('GET /type/:name from Mikr.us API returns type data', async ({ request }) => {
    const response = await request.get(`${MIKRUS_API_BASE}/type/fire`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.name).toBe('fire');
    expect(data.pokemon).toBeDefined();
    expect(Array.isArray(data.pokemon)).toBeTruthy();

    // Verify fire-type Pokemon are included
    const firePokemons = data.pokemon.map((p: { pokemon: { name: string } }) => p.pokemon.name);
    expect(firePokemons).toContain('charmander');
    expect(firePokemons).toContain('charizard');
  });

  test('Mikr.us API handles invalid Pokemon ID gracefully', async ({ request }) => {
    const response = await request.get(`${MIKRUS_API_BASE}/pokemon/999`);
    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data.error).toBe('Pokemon not found');
  });

  test('Mikr.us API handles invalid Pokemon name gracefully', async ({ request }) => {
    const response = await request.get(`${MIKRUS_API_BASE}/pokemon/invalidname`);
    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data.error).toBe('Pokemon not found');
  });

  test('Mikr.us API enforces Generation 1 limit (ID > 151)', async ({ request }) => {
    const response = await request.get(`${MIKRUS_API_BASE}/pokemon/152`); // Chikorita (Gen 2)
    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data.error).toBe('Pokemon not found');
  });

  test('Mikr.us API images are accessible', async ({ request }) => {
    // First get Pokemon data to get image URL
    const pokemonResponse = await request.get(`${MIKRUS_API_BASE}/pokemon/1`);
    expect(pokemonResponse.ok()).toBeTruthy();

    const pokemonData = await pokemonResponse.json();
    const imageUrl = pokemonData.sprites.front_default;

    // Test if image is accessible
    const imageResponse = await request.get(imageUrl);
    expect(imageResponse.ok()).toBeTruthy();
    expect(imageResponse.headers()['content-type']).toContain('image');
  });
});
