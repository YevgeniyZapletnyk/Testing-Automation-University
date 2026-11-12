import { test, expect } from '@playwright/test';
const delays = [500, 1500, 2500, 500, 1500, 2500, 500, 1500, 2500, 500];
for (const mode of ['model1000', 'modelAuto', 'model5000']) {
  test(mode, async ({ page }, info) => {
    await page.setContent('<div data-test="status">Loading</div>');
    await page.evaluate((delay) => {
      setTimeout(() => {
        document.querySelector('[data-test="status"]')!.textContent = 'Ready';
      }, delay);
    }, delays[info.repeatEachIndex]);
    if (mode === 'modelAuto') {
      await expect(page.getByTestId('status')).toHaveText('Ready');
    } else {
      await page.waitForTimeout(mode === 'model1000' ? 1000 : 5000);
      expect(await page.getByTestId('status').textContent()).toBe('Ready');
    }
  });
}
