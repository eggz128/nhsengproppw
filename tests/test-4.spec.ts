import  {expect} from '@playwright/test';
import {test} from './my-test' //special extended version of test that adds the person parameter
import { HomePOM } from './POMs/HomePOM';
import { LoginPOM } from './POMs/LoginPOM';
import logins from './TestData/logins.json'; //Import Test Data JSON for simple data driven testing
test('Traditional Test', async ({ page }) => {
  //Recorded
  //Mixes locators, user actions and assertions
  //Lots of 'noise' can make it difficult to reason about what is going on
  await page.goto('https://www.edgewordstraining.co.uk/webdriver2/');
  await page.getByRole('link', { name: 'Login To Restricted Area' }).click();
  await page.getByRole('row', { name: 'User Name?' }).locator('#username').click();
  await page.getByRole('row', { name: 'User Name?' }).locator('#username').fill('edgewords');
  await page.locator('#password').click();
  await page.locator('#password').fill('edgewords123');
  await page.getByRole('link', { name: 'Submit' }).click();
  await expect(page.locator('h1')).toContainText('Add A Record To the Database');

  await expect(page.locator('body')).toContainText(/^User is Logged in.*/,{useInnerText: true}); 
  //Set up handler for the js prompt for logout
  page.on('dialog', async dialog => { //This usually records just fine - but had to be added manually this time
    //expect(dialog.message).toBe('Do you really want to logout?')
    await dialog.accept();
  })
  //Trigger the JS logout prompt
  await page.getByRole('link', { name: 'Log Out' }).click();
  //Interstital page
  //Check we are back on the login page

  //await expect(page.locator('body')).toContainText(/^User is not Logged in.*/,{useInnerText: true}); 
  await expect(page).toHaveURL(/\/sdocs\/auth\.php$/);
});

test('Pomified test', async({page})=>{
  await page.goto('https://www.edgewordstraining.co.uk/webdriver2/');
  //Test is easier to reason about and understand - you can quickly see what it is trying to do, without the noise of *how*
  const homePage = new HomePOM(page); //Create a page object instance as and when the test needs to do something on that page
  await homePage.goLogin();
  const loginPage = new LoginPOM(page);
  // //Use 'low level' service methods to interact with the page
  // await loginPage.fillUsername('edgewords');
  // await loginPage.fillPassword('edgewords123');
  // await loginPage.submitForm();

  //Fluid coding by having methods "return this" - uglier than I thought it would be
  //(await (await loginPage.fillUsername('edgewords')).fillPassword('edgewords123')).submitForm();
  //There may be a nicer way to achieve this. I'll look in to it...
  //...there is not. At least not simply by using "return this" in the service methods
  //You could create a fluent chainable promise based interface, but the code in the service methods to achieve this would be horrid.
  //https://stackoverflow.com/questions/54339573/how-to-define-a-promise-chain-without-using-then-method
  //Just use seperate await statements as above
  //If you *really* want to chain, you ccould use then()...but this looks worse than just seperate awaits
  // await loginPage.fillUsername('edgewords')
  // .then(()=>loginPage.fillPassword('edgewords123'))
  // .then(()=>loginPage.submitForm());
  //In fact async/await is "syntactic sugar" created (at least partially) to get away from this then().then() chaining
  
  //Updating locators from the test
  //since password field isn't readonly in POM, you could just change the locator now
  //(A bit of a POM design pattern violation as now the test knows about locators)
  //loginPage.passwordField = page.locator('#password');
  
  //Rather than trying to create fancy fluent method chaining interfaces, just create sensible higher level helpers
  await loginPage.login('edgewords', 'edgewords123');
  
})

logins.forEach(login =>{ //create a test for each individual login
  test(`Data driven test for username: ${login.username}`, async({page})=>{
    await page.goto('https://www.edgewordstraining.co.uk/webdriver2/');
    const homePage = new HomePOM(page);
    await homePage.goLogin();
    const loginPage = new LoginPOM(page);
    await loginPage.login(login.username, login.password);
  })
})

//Same thing but with a for loop - if you prefer that
for(const login of logins){
  test(`For Loop Data driven test for username: ${login.username}`, async({page})=>{
    await page.goto('https://www.edgewordstraining.co.uk/webdriver2/');
    const homePage = new HomePOM(page);
    await homePage.goLogin();
    const loginPage = new LoginPOM(page);
    await loginPage.login(login.username, login.password);
  })
}

test(`Project parameterisation`, async({page, person})=>{ //person fixture is defined in my-test.ts , projects can have different values set in playwright.config.ts
  await page.goto('https://www.edgewordstraining.co.uk/webdriver2/');
  const homePage = new HomePOM(page);
  await homePage.goLogin();
  const loginPage = new LoginPOM(page);
  await loginPage.login(person, "edgewords123"); //Will be dave for chromium, sarah for firefox, paul for any other project (default)
})

test('Screenshots and reporting',{tag: ['@smoke', '@regression'],
  annotation: [
    {type:"Custom annotation 1", description: "This is a custom annotation"}, //Could be useful to include links to specific issues this test covers
    {type:"Custom annotation 2", description: "This is another custom annotation"}
  ]
}, async({page, browserName}, testInfo)=>{ //testInfo givers access to the report, and other test information
  await page.goto('https://www.edgewordstraining.co.uk/webdriver2/docs/basicHtml.html');
  const screenshot = await page.screenshot(); //Capture screenshot bitmap in variable. Note there is not an easy way to assert on this currently. See workaround test.
  await page.screenshot({path: './manualscreenshots/screenshot-viewport.png'});
  await page.screenshot({path: './manualscreenshots/screenshot-fullpage.png', fullPage: true});

  const htmlTable = page.locator('#htmlTable');
  await htmlTable.screenshot({ path: './manualscreenshots/screenshot-table.png' }); //Just the table, not the whole page

  await page.locator('#htmlTable').screenshot({
    path: './manualscreenshots/highlight-htmltable.png',
    mask: [page.locator('#TableVal2')], //Redact or highlight this element
    maskColor: 'rgba(214, 21, 179,0.5)', //default mask colour is magenta #ff00ff
    style: `#htmlTable tr:nth-child(3) {border: 10px solid red}
            table#htmlTable {border-collapse: collapse}
    ` //HTML table rows cannot have a border unless the table's border collapse model is set to collapse
  })

  if(browserName==="chromium"){ //PDF generation only works on Chromium browsers, and can be headless/headed (error is misleading)
    await page.pdf({ path: './manualscreenshots/printed.pdf' })
  }
  

  console.log("Appears in std out section of the report") //In report at bottom, displayed in terminal at run time
  //Attaching arbitary data to the report.
  await testInfo.attach('Write some arbitary text to the report', {body: 'Hello World', contentType: 'text/plain'});
  await testInfo.attach('Masked Screenshot', {path: './manualscreenshots/highlight-htmltable.png', contentType: 'image/png'});
  await testInfo.attach('Screenshot from variable', {body: screenshot, contentType: 'image/png'});
});
