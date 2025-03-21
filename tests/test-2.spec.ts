import { test, expect } from '@playwright/test';

test('test', {tag: ['@smoke','@runme']},async function({ page }){
  // Recording...
  //await driver.get('https://www.edgewordstraining.co.uk/demo-site/'); //equiv webdriver js
  await page.goto('/demo-site/'); //First part of URL is specified as baseUrl in playwright.config.ts
  
  //Instead of repeating the locator 3 times...
  // await page.getByRole('searchbox', { name: 'Search for:' }).click();
  // await page.getByRole('searchbox', { name: 'Search for:' }).fill('cap');
  // await page.getByRole('searchbox', { name: 'Search for:' }).press('Enter');
  //..we can store it in a variable. No need to await the locator, as the search actually happens when the action takes place
  const searchBox = page.getByRole('searchbox', { name: 'Search for:' });
  await searchBox.click(); //first find element, then do action
  await searchBox.fill('cap'); //first find element, then do action
  await searchBox.press('Enter'); //first find element, then do action

  // Browser->PleaseFindThisElement->When you have it, do this
  // This is a common pattern used by other testing tools also e.g. Cypress, WebDriver etc
  await page.getByRole('button', { name: 'Add to cart' }).click();

  // Last example of equivalent WebDriver code
  // Element searches can be chained - i.e. find Element A, inside ELement A find Element B
  //await driver.findElement(By.Css('#content)).findElement(By.LinkText('View cart')).click()
  await page.locator('#content').getByRole('link', { name: 'View cart', exact: true }).click(); //name: is case insensitive by default and performs a sub string match
  await page.getByRole('link', { name: 'Remove this item' }).click();
  await page.getByRole('link', { name: 'Return to shop' }).click();
  await page.locator('#menu-item-42').getByRole('link', { name: 'Home' }).click();
  
  //await page.close();
});

test('test2', async({page})=>{
  //Playwright establishes brand new page contexts for each test.
  //There is no need to tear down the browser and spin up a new browser between tests to avoid accidental shared state between tests
  // e.g. like in WebDriver 
  await page.goto('https://www.google.com/')
  //await page.close(); //Forcing the browser to close like this only slows down your test runs as PW will have to spend time reopening the browser for the next test
})

test('all products', async ({ page }) => {
  await page.goto('https://www.edgewordstraining.co.uk/demo-site/');
  const newProducts = page.getByLabel('Recent Products');
  for (const prod of await newProducts.locator('h2:not(.section-title)').all()) { //gathers a collection of all() matching elements
    console.log(await prod.textContent()); //then loops over each individual match logging the text
  }; //No need to await console, but you do need to await the locator. Or you will only get the "promise" of the text, not the actual text.
  
});

test('Locator Handler', async ({ page }) => {
  // Setup the handler.
  const cookieConsent = page.getByRole('heading', { name: 'Hej! You are in control of your cookies.' });
  await page.addLocatorHandler(
    cookieConsent, //Locator to watch out for
    async () => { //If spotted, what to do
      await page.getByRole('button', { name: 'Accept all' }).click();
    }
    , //Optional arguments - can be omitted
    {
      times: 10, //How many times the locator may appear before the handler should stop handling the locator
      //By default Playwright will wait for the locator to no longer be visible before continuing with the test.
      noWaitAfter: true //this can be overridden however
    }
  );

  // Now write the test as usual. If at any time the cookie consent form is shown it will be accepted.
  await page.goto('https://www.ikea.com/');
  await page.getByRole('link', { name: 'Collection of blue and white' }).click();
  await expect(page.getByRole('heading', { name: 'Light and easy' })).toBeVisible();

  //If you're confident the locator will no longer be found you can de-register the handler
  //await page.removeLocatorHandler(cookieConsent);
  //If the cookie consent form appears from here on it may cause issues with the test...
  await page.waitForTimeout(5000);
})

test('actions', async({page})=>{
  await page.goto('https://www.edgewordstraining.co.uk/webdriver2/docs/index.html');
  await page.getByRole('link', { name: 'Forms' }).click();
  await page.locator('#textInput').click();
  await page.locator('#textInput').fill('Steve Powell');
  await page.locator('#textInput').fill('Stephen Powell'); //Fill auto clears the text box before entry (no append)
  //await page.locator('#textInput').clear(); //Manually clears the text box "by magic". 99.999% of the time that's fine.
  await page.locator('#textInput').press('Control+KeyA'); //However you could use keyboard shortcuts to clear exactly like a user might
  await page.locator('#textInput').press('Backspace'); 
  await page.locator('#textInput').pressSequentially(' should append', {delay: 200}); //wont clear, just append, and will do so with slow keypresses
  await page.locator('#textArea').click();
  await page.locator('#textArea').fill('was\nhere\n'); //Multiline text entry - \n = new line
  await page.locator('#checkbox').check(); //Ensure checkbox is on
  await page.locator('#checkbox').click(); //Toggle off
  await page.locator('#checkbox').click(); //Toggle on
  await page.locator('#checkbox').uncheck(); //Force off
  await page.locator('#select').selectOption('Selection Two');
  await page.locator('#two').check(); //Also works for radio buttons
  await expect.soft(page.locator('input[type=radio]')).toHaveCount(2); //Soft asserts fail the test but allow code execution to continue within the test
  await expect(page.locator('input[type=radio]')).toHaveCount(3); //A (non soft) failed assertion will stop and fail the test here. The following line would not execute.
  await page.getByRole('link', { name: 'Submit' }).click();
});

test('drag drop slider', async ({ page }) => {
  await page.goto('https://www.edgewordstraining.co.uk/webdriver2/docs/cssXPath.html')

  await page.locator('#apple').scrollIntoViewIfNeeded();
  //Dragging 'outside' of an element normally fails due to 'actionability' checks. force:true tells Playwright just to do the action skipping any checks.
  await page.dragAndDrop('#slider a', '#slider a', {targetPosition: {x: 100, y:0}, force: true}) //While this moves the gripper it wont change the size of the apple - this is due to the JS on the page that does the resizing not firing properly for large movements
  //await page.click('css=#slider a') //Old way of clicking things - stilll works but prefer page-findelement-click
  await page.locator('#slider a').click();
  //So instead do lots of little jumps. Just make sure that you 'jump' far enough to get 'outside' the gripper each time
  // await page.dragAndDrop('#slider a', '#slider a', { targetPosition: { x: 20, y: 0 }, force: true })
  // await page.dragAndDrop('#slider a', '#slider a', { targetPosition: { x: 20, y: 0 }, force: true })
  // await page.dragAndDrop('#slider a', '#slider a', { targetPosition: { x: 20, y: 0 }, force: true })
  // await page.dragAndDrop('#slider a', '#slider a', { targetPosition: { x: 20, y: 0 }, force: true })
  //We should probably write a custom function for this 'lots of little jumps' drag and drop... e.g. 
  //await smoothDrag(page, '#slider a', 200, 5); //ToDo: write this function. 200 is the distance to move, 5 is the number of "jumps"

})