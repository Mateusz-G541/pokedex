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
    const response = await request.get('/api/pokemon/random-legendary');
    expect(response.ok()).toBeTruthy();
    const data = (await response.json()) as PokemonResponse;
    expect(data.name).toBeDefined();
    expect(data.id).toBeDefined();
    expect(data.types).toBeDefined();
    expect(data.sprites).toBeDefined();
  });
});
