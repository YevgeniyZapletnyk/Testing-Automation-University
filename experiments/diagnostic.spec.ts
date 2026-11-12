import { test, expect } from '@playwright/test';
import { login } from '../tests/e2e/helpers';
test('D1: intentional incorrect count 7 instead of 6', async ({ page }) => {
  await login(page);
  await expect(page.getByTestId('inventory-item')).toHaveCount(7);
});
