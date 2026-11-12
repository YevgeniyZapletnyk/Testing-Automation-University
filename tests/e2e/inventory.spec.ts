import { test, expect } from '@playwright/test';
import { login, product } from './helpers';
test.beforeEach(async ({ page }) => {
  await login(page);
});
test('I1: six products', async ({ page }) => {
  await expect(page.getByTestId('inventory-item')).toHaveCount(6);
});
test('I2: prices sorted low to high', async ({ page }) => {
  await page.getByTestId('product-sort-container').selectOption('lohi');
  await expect(page.getByTestId('product-sort-container')).toHaveValue('lohi');
  await expect(page.getByTestId('inventory-item-price')).toHaveText([
    '$7.99',
    '$9.99',
    '$15.99',
    '$15.99',
    '$29.99',
    '$49.99',
  ]);
});
test('I3: adding one product updates badge', async ({ page }) => {
  await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
  await product(page, 'Sauce Labs Backpack')
    .getByRole('button', { name: 'Add to cart' })
    .click();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
});
test('I4: removing product clears badge', async ({ page }) => {
  const item = product(page, 'Sauce Labs Bike Light');
  await item.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
  await item.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
  await expect(item.getByRole('button', { name: 'Add to cart' })).toBeVisible();
});
