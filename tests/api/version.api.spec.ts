import { test, expect } from '@playwright/test';

test.describe('Version endpoint', () => {
  test('GET /api/version returns 200', async ({ request }) => {
    const response = await request.get('/api/version');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('version');
  });
});
