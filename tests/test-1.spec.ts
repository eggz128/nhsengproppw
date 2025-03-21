import { test, expect } from '@playwright/test'; //bring in test and expect methods from playwright for use in this file

test('This is the test name', async({page})=> { //This is a test method - the second parameter is an async function (as a lambda expression here)
  //Test stuff happens here
  //await keyword is *very* impotant for playwright as the commands are asynchronous (i.e. execute "now" but have their effects "later")
  // if you remove all the await keywords the test will have executed, completed and exited before the browser has had a chance to *do* anything = errors

  //await keyword can only be used in async functions - which this is.

  // Recorded using Tests>Record New
  await page.goto('https://www.edgewordstraining.co.uk/webdriver2/');
  await page.getByRole('link', { name: 'Login To Restricted Area' }).click();
  await page.getByRole('row', { name: 'User Name?' }).locator('#username').click();
  await page.getByRole('row', { name: 'User Name?' }).locator('#username').fill('webdriver');
  await page.locator('#password').click();
  await page.locator('#password').fill('edgewords123');
  await page.getByRole('link', { name: 'Submit' }).click();
  await expect(page.locator('h1')).toContainText('Add A Record To the Database');
  
});

//Be careful with "Record at cursor" - it will *literally* record at wherever your cursor is
// even here, outside of a test method - so this isn't valid
// (hence commented out)
//await page.getByRole('link', { name: 'Submit' }).click();

