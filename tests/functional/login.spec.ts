import { test, expect } from '@playwright/test';

/**
 * Mocks the Supabase auth OTP endpoint so the form submission succeeds
 * without a real email being sent.
 *
 * Note: requires NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
 * to be set to anything non-empty (e.g. https://example.supabase.co) so
 * createBrowserClient doesn't throw before our mock takes effect.
 */
test.beforeEach(async ({ page }) => {
  await page.route('**/auth/v1/otp**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ messageId: 'mock-message' }),
    });
  });
});

test.skip(
  !process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_URL not set — set to any placeholder URL to run functional tests',
);

test('submitting login form sends magic link request and shows confirmation', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByRole('button', { name: /Send magic link/i }).click();

  await expect(page.getByText(/Check your email/i)).toBeVisible();
});

test('submitting login form with API error shows toast', async ({ page }) => {
  // Override the beforeEach mock with an error response
  await page.route('**/auth/v1/otp**', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'invalid email', error_description: 'Email is invalid' }),
    });
  });

  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByRole('button', { name: /Send magic link/i }).click();

  await expect(page.getByText(/invalid/i).first()).toBeVisible({ timeout: 5000 });
});
