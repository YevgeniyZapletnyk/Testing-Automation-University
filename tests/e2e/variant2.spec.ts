import { test, expect } from '@playwright/test';
import { PRODUCTS } from './data';
import { login, product, addThree } from './helpers';
test.beforeEach(async ({ page }) => {
  await login(page);
});
test('V1: badge counts three distinct products', async ({ page }) => {
  const badge = page.getByTestId('shopping-cart-badge');
  await expect(badge).toHaveCount(0);
  for (const [index, item] of PRODUCTS.entries()) {
    const card = product(page, item.name);
    await card
      .getByRole('button', { name: 'Add to cart', exact: true })
      .click();
    await expect(badge).toHaveText(String(index + 1));
    await expect(
      card.getByRole('button', { name: 'Remove', exact: true }),
    ).toBeVisible();
  }
  await expect(badge).toHaveText('3');
});
test('V2: cart contains exactly the three selected products', async ({
  page,
}) => {
  await addThree(page);
  await page.getByTestId('shopping-cart-link').click();
  await expect(page).toHaveURL(/\/cart\.html$/);
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('3');
  await expect(page.getByTestId('inventory-item')).toHaveCount(3);
  for (const item of PRODUCTS) {
    const row = product(page, item.name);
    await expect(row).toHaveCount(1);
    await expect(row.getByTestId('inventory-item-name')).toHaveText(item.name);
    await expect(row.getByTestId('inventory-item-price')).toHaveText(
      item.price,
    );
    await expect(row.getByTestId('item-quantity')).toHaveText('1');
  }
  await page.screenshot({
    path: `evidence/cart-${test.info().project.name}.png`,
    fullPage: true,
  });
});
