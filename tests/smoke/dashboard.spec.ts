import { test, expect } from '@playwright/test';

test('login page renders without console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('pageerror', (err) => consoleErrors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // Unauthenticated → /login (or no redirect if Supabase env not configured)
  await page.goto('/login');
  await expect(page.getByText('Sign in to Stax')).toBeVisible();

  expect(consoleErrors).toEqual([]);
});

test('login page has email input + submit button', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByRole('button', { name: /Send magic link/i })).toBeVisible();
});
