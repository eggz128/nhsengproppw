import {test, expect} from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('https://www.edgewordstraining.co.uk/webdriver2/sdocs/add_record.php');
});

test('Should already be logged in', async ({ page }) => {
    
    await page.waitForTimeout(1000);
    await expect(page.locator('h1')).toContainText('Add A Record');
    await page.waitForTimeout(1000);

});

test('Should already be logged in2', async ({ page }) => {
    
    await page.waitForTimeout(1000);
    await expect(page.locator('h1')).toContainText('Add A Record');
    await page.waitForTimeout(1000);

});
