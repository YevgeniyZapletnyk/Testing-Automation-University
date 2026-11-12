import { test, expect } from '@playwright/test';
import { USERS } from '../tests/e2e/data';
for (const mode of ['pause1000', 'auto', 'pause5000']) {
  test(mode, async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill(USERS.slow.username);
    await page.getByTestId('password').fill(USERS.slow.password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    if (mode === 'auto') {
      await expect(page).toHaveURL(/inventory/);
      await expect(page.getByTestId('title')).toHaveText('Products');
    } else {
      // Only the deliberately isolated experiment uses fixed pauses.
      await page.waitForTimeout(mode === 'pause1000' ? 1000 : 5000);
      expect(await page.getByTestId('title').textContent()).toBe('Products');
    }
  });
}
