import { expect, type Page } from '@playwright/test';
import { USERS, PRODUCTS } from './data';
export async function login(
  page: Page,
  username: string = USERS.standard.username,
) {
  await page.goto('/');
  await page.getByTestId('username').fill(username);
  await page.getByTestId('password').fill(USERS.standard.password);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(page.getByTestId('title')).toHaveText('Products');
}
export function product(page: Page, name: string) {
  return page.getByTestId('inventory-item').filter({
    has: page.getByTestId('inventory-item-name').filter({
      hasText: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
    }),
  });
}
export async function addThree(page: Page) {
  for (const item of PRODUCTS) {
    await product(page, item.name)
      .getByRole('button', { name: 'Add to cart', exact: true })
      .click();
  }
}
