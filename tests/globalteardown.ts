import {test as teardown} from '@playwright/test';

teardown('logout', async ({ page }) => {
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {});
    });
    await page.getByRole('link', { name: 'Log Out' }).click();
});