import { test, expect } from '@playwright/test';

/**
 * Integration test: real Supabase test project.
 *
 * Requires these env vars in your shell or .env.local:
 *   TEST_SUPABASE_URL
 *   TEST_SUPABASE_ANON_KEY
 *   TEST_SUPABASE_USER_EMAIL
 *   TEST_SUPABASE_USER_PASSWORD
 *
 * The test user must already exist in the test project.
 * Auth method used: signInWithPassword (not magic link) so the test is hermetic.
 */

const URL_VAL = process.env.TEST_SUPABASE_URL;
const ANON = process.env.TEST_SUPABASE_ANON_KEY;
const EMAIL = process.env.TEST_SUPABASE_USER_EMAIL;
const PASSWORD = process.env.TEST_SUPABASE_USER_PASSWORD;

const skipIfNoEnv = !URL_VAL || !ANON || !EMAIL || !PASSWORD;

test.skip(skipIfNoEnv, 'TEST_SUPABASE_* env vars not set — see tests/integration/login.spec.ts');

test('full login round-trip against real Supabase test project', async ({ page, request }) => {
  const otpRes = await request.post(`${URL_VAL}/auth/v1/token?grant_type=password`, {
    headers: { apikey: ANON!, 'Content-Type': 'application/json' },
    data: { email: EMAIL, password: PASSWORD },
  });
  expect(otpRes.ok()).toBeTruthy();
  const session = await otpRes.json();
  expect(session.access_token).toBeTruthy();

  const projectRef = new URL(URL_VAL!).hostname.split('.')[0];
  const cookieName = `sb-${projectRef}-auth-token`;
  await page.context().addCookies([
    {
      name: cookieName,
      value: encodeURIComponent(JSON.stringify(session)),
      domain: 'localhost',
      path: '/',
    },
  ]);

  await page.goto('/dashboard');
  await expect(page.getByText('Dashboard')).toBeVisible();
});
