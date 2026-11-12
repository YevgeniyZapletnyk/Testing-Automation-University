import { test, expect } from '@playwright/test';
import { USERS } from './data';
import { login } from './helpers';
test('L1: correct credentials open inventory', async ({ page }) => {
  await login(page);
  await expect(page.getByTestId('inventory-item')).toHaveCount(6);
});
test('L2: locked account stays on login page', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username').fill(USERS.locked.username);
  await page.getByTestId('password').fill(USERS.locked.password);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByTestId('error')).toContainText(/locked out/i);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId('inventory-container')).toHaveCount(0);
});
test('L3: empty credentials are rejected', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByTestId('error')).toContainText('Username is required');
  await expect(page).toHaveURL(/\/$/);
});
test('L4: slow account reaches inventory', async ({ page }) => {
  await login(page, USERS.slow.username);
  await expect(page.getByTestId('inventory-item')).toHaveCount(6);
});
