import { test, expect } from '@playwright/test';

//Hooks - apply to all tests in this file
test.beforeAll(async ()=>{
  console.log('Runs once before any tests get to execute in this file')
})

test.beforeEach(async ({page})=>{
  await page.goto('https://www.google.com');
  console.log('Runs before each and every test in this file')
})

test.afterEach(async ({page})=>{
  await page.goto('https://www.google.com');
  console.log("Runs after each and every test in this file")
})

test.afterAll(()=>{
  console.log("Runs just before exiting this file")
})

test('assertions', async ({ page }) => {

  await page.goto('https://www.edgewordstraining.co.uk/webdriver2/');
  await page.getByRole('link', { name: 'Access Basic Examples Area' }).click();
  await page.getByRole('link', { name: 'Forms' }).click();

  await expect(page.getByRole('heading', { name: 'Forms' })).toBeVisible();

  // const slowExpect = expect.configure({timeout: 7000})

  // await slowExpect.soft(page.getByRole('paragraph')).toContainText('This form has aN');
  // await slowExpect.soft(page.locator('#textInput')).toHaveValue('Steve Powell');
  //
  // //ARIA Snapshots let you verify the accessibility tree hasn't changed (because the site has been refactored)
  // //They say *nothing* of if it's a *good* and useful accessibility tree
  //
  // //The accessibility tree is essentially what screenreaders and other assistance tools use 
  // await expect(page.locator('#right-column')).toMatchAriaSnapshot(`
  //   - heading "Forms" [level=1]
  //   - paragraph: This form has an id of theForm.
  //   - table:
  //     - rowgroup:
  //       - row "Text Input with id/name textInput * Steve Powell":
  //         - cell "Text Input with id/name textInput *"
  //         - cell "Steve Powell":
  //           - textbox: Steve Powell
  //       - row "Text Area with id/name textArea":
  //         - cell "Text Area with id/name textArea"
  //         - cell:
  //           - textbox
  //       - row "Checkbox with id/name checkbox":
  //         - cell "Checkbox with id/name checkbox"
  //         - cell:
  //           - checkbox
  //       - row "Select with id/name select Selection One":
  //         - cell "Select with id/name select"
  //         - cell "Selection One":
  //           - combobox:
  //             - option "Selection One" [selected]
  //             - option "Selection Two"
  //             - option "Selection Three"
  //       - row "Radio buttons with id/name radio One Two Three":
  //         - cell "Radio buttons with id/name radio"
  //         - cell "One Two Three":
  //           - radio [checked]
  //           - radio
  //           - radio
  //       - row "Password input with id/name password":
  //         - cell "Password input with id/name password"
  //         - cell:
  //           - textbox
  //       - row "File selector with id/name file":
  //         - cell "File selector with id/name file"
  //         - cell:
  //           - textbox
  //       - row "Submit Clear":
  //         - cell
  //         - cell "Submit Clear":
  //           - link "Submit"
  //           - link "Clear"
  //       - row "* Mandatory field.":
  //         - cell "* Mandatory field."
  //   `);

  await expect(page).toHaveTitle("Forms");
  await expect(page.getByRole('heading', { name: 'Forms' })).toBeVisible();
  await expect(page.getByRole('paragraph')).toContainText(/This form has an id Of .*/i); //Substring matches - can also use RegEx
  //await expect(page.getByRole('paragraph')).toHaveText('This form has an id of ');//exact match needed
  await expect(page.locator('#textInput')).toBeEmpty();

  await page.locator('#textInput').fill('Steve Powell');

  //Will fail on first run, but will generate the "golden" sample/reference image for future runs
  await expect(page.locator('#textInput')).toHaveScreenshot('textbox.png', {
    threshold: 1, //Allowable colour variance
    maxDiffPixelRatio: 1 //Allowable different pixels
  }) //Will still fail if the image sizes don't match

  //await expect(page.locator('#textInput')).toHaveText('Steve Powell'); //NO. <input> can't have a closing tag, therefore no inner text
  await expect(page.locator('#textInput')).toHaveValue('Steve Powell');

  //toHaveText() can be used with an array against an array of elements
  //await expect(page.locator('a.orange-button:visible'))//There's a 'hidden' orange 'button' - :visible is a PW CSS psuedo class extension
  await expect(page.locator('a.orange-button').filter({ visible: true })) //Alternative to :visible - use filter()
    .toHaveText(['Submit', 'Clear']);

  //Use Promise to evalute assertions in parallel/concurrently 
  // const results1 = await Promise.all([
  //   expect.soft(page.locator('#one')).toHaveValue('OneX'), //Note no await. We'll let Promise.All() wait for the promises to settle
  //   expect.soft(page.locator('#two')).toHaveValue('Two'), //If you use await the expects will be evaluated in sequence
  //   expect.soft(page.locator('#three')).toHaveValue('ThreeX',{timeout: 7000}) //soft expects are used so the first promise rejection (assertion failiure) doesnt immediately fail the test. **BUT** there is a race - if one assertion/promise has a longer timeout it wont be reported on as Promise.all() resolves as soon as the first rejecction takes place.
  // ])
  // console.log("results1", results1) //array of 3 undefined?? https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all

  // //Promise.all() and soft assserts do fail the test (as expected) and allow execution to continue... maybe not what is wanted

  // const results2 = await Promise.all([ //returns as soon as one promise is rejected, so last fail not reported. Beware races.
  //   expect(page.locator('#one')).toHaveValue('OneX'), //Note no await. We'll let Promise.All() wait for the promises to settle
  //   expect(page.locator('#two')).toHaveValue('Two'), //If you use await the expects will be evaluated in sequence
  //   expect(page.locator('#three')).toHaveValue('ThreeX',{timeout: 7000})
  // ]) //no soft assert so will stop here
  //.catch((err) => console.error(err)) //unless error is caught. Error contains details of the *first* rejected promise
  //console.log("results2", results2)




  //This looks the most promising

  // //allSettled() will wait for the assertions to settle, and
  // const results = await Promise.allSettled([ //returns array of objects with "status" and "reason" properties
  //   expect(page.locator('#one')).toHaveValue('OneX'), 
  //   expect(page.locator('#two')).toHaveValue('Two'), 
  //   expect(page.locator('#three')).toHaveValue('ThreeX', {timeout: 7000}) 
  // ])
  // //However the test actually passes (unlike all() + soft asserts) and execution continues...
  // //I guess it's up to us to decide to stop if any of the object statuses are "rejected"
  // if (results.some((result) => result.status === 'rejected')) {
  //   for (const result of results) {
  //     if (result.status === 'rejected') {
  //       console.error(`Assertion failed: ${result.reason}`);
  //     }
  //   }
  //   throw new Error(`Some assertions failed`); //Not ideal reporting, but failiure messages are at least now in the reports stderr attachment 
  // }

  // console.log("Fin") //Didn't get here - good!

  // const results = await Promise.allSettled([ //returns array of objects with "status" and "reason" properties
  //   expect(page.locator('#one')).toHaveValue('OneX'), 
  //   expect(page.locator('#two')).toHaveValue('Two'), 
  //   expect(page.locator('#three')).toHaveValue('ThreeX', {timeout: 7000}) 
  // ]).catch(err => console.log("caught: ", err)) //no err thrown despite rejected promise
  // .then(results => console.log("then: ", results)) //we get the array of objects with the outcome of each promise
  // .finally(() => console.log("finally"));

  //Looks like Promise.allSettled() is the way to go - then examine the returned object and decide to stop or not (i.e. soft assert)
});

//test.describe allows tests to be grouped within a file. Useful for more specific hooks, and to change common config options
test.describe("A test suite", () => {
  test.beforeAll(()=>{
    console.log("Before all specific to this describe block")
  })
  test.skip("compare runtime images",{tag:['@ignore','@smoke']}, async ({ page, browserName }, testInfo) => {
    
    await page.goto("https://www.edgewordstraining.co.uk/webdriver2/docs/forms.html");

    await page.locator('#textInput').fill("Hello World"); //Set intial state

    //ToDo: capture screenshot of text box in memory
    //Capture in mem is easy - doing the expect on it after, not so much as PlayWright expect .toMatchSnapshot() expects the screenshot to be on disk
    //See https://github.com/microsoft/playwright/issues/18937

    //const originalimage = await page.locator('#textInput').screenshot();
    //originalimage is now a buffer object with the screenshot. You could use a 3rd party js lib to do the comparison... but if we're sticking to Playwright only...

    //await expect(page.locator('#textInput')).toHaveScreenshot('textbox')
    //No good as PW wants to capture the screenshot on the first run and use that screenshot for following runs. We want to capture and use on this run. So...

    await page.locator('#textInput').screenshot({ path: `${testInfo.snapshotDir}/textbox2-${browserName}-${testInfo.snapshotSuffix}.png` })
    //screenshots will need to vary by browser and OS, and be saved in to the test snapshot directory for .toMatchSnapshot() to find them


    //Change element text
    await page.locator('#textInput').fill("Hello world"); //Alter the state (right now this is the same as initially set so following expect *should* pass)
    //change to e.g. "Hello world"

    //Recapture screenshot, compare to previous (on disk) version.
    expect(await page.locator('#textInput').screenshot()).toMatchSnapshot('textbox2.png')

    //Now go look at the html report
  });
  test.describe("Inner suite", ()=>{
    test.use({actionTimeout: 10000}) //10s action timeout for this unner suite only
    test("Capturing values", async ({ page }) => {
      await page.goto("https://www.edgewordstraining.co.uk/webdriver2/docs/forms.html");
      await page.locator('#textInput').fill("Hello World");
  
      let rightColText = await page.locator('#right-column').textContent(); //Includes whitespace in HTML file
  
      console.log("The right column text is with textContent is: " + rightColText);
  
      rightColText = await page.locator('#right-column').innerText(); //Captures text after browser layout has happened (eliminating most whitespace)
  
      console.log("The right column text is with innertext is: " + rightColText);
  
      let textBoxText: string = await page.locator('#textInput').textContent() ?? ""; //TS: if textContent() returns null, retuen empty string "" instead
      console.log("The text box contains" + textBoxText); //blank as <input> has no inner text
  
      //Using generic $eval to get the browser to return the INPUT text
      //This will *not* retry or wait
      textBoxText = await page.$eval('#textInput', (el: HTMLInputElement) => el.value); //el is an in browser HTML element - not a Playwright object at all.
      console.log("The text box actually contains: " + textBoxText);
  
      // await page.$eval('#textInput', elm => {
      //     console.log(typeof(elm))
      // });
  
      expect(textBoxText).toBe("Hello World");
    });
  
    test("Generic methods", async ({ page }) => {
  
      await page.goto("https://www.edgewordstraining.co.uk/webdriver2/docs/forms.html")
  
      const menuLinks = await page.$$eval('#menu a', (links) => links.map((link) => link.textContent))
      console.log(`There are ${menuLinks.length} links`)
  
      console.log("The link texts are:")
  
      for (const iterator of menuLinks) {
        console.log(iterator?.trim())
      }
  
      //Preferred - using retry-able Playwright locators
      const preferredLinks = await page.locator('#menu a').all();
      for (const elm of preferredLinks) {
        // const elmtext = await elm.textContent();
        // const elmtexttrimmed = elmtext?.trim();
        console.log(`${await elm.textContent().then(text => { return text?.trim() })}`)
      }
    })
  })
  

  test('waits', async ({ page }) => {

    await page.goto('https://www.edgewordstraining.co.uk/webdriver2/');
    await page.getByRole('link', { name: 'Access Basic Examples Area' }).click();
    await page.pause();
    await page.getByRole('link', { name: 'Dynamic Content' }).click();
    await page.locator('#delay').click();
    await page.locator('#delay').fill('10');
    await page.getByRole('link', { name: 'Load Content' }).click();
    //await page.locator('#image-holder > img').click({timeout: 3000});
    await page.waitForSelector('#image-holder > img', { timeout: 12000, state: 'visible' });
    await page.locator('#image-holder > img').click();
    await page.getByRole('link', { name: 'Home' }).click();

  })

  test("Waiting for a pop up window", async ({ page, context }) => {
    await page.goto("https://www.edgewordstraining.co.uk/webdriver2/docs/dynamicContent.html")

    //[a,b] = [10,20] - aray destructuring syntax will assign a=10 b=20
    //Below we discard the second promise return value - we only need the first which gets us a handle to the new page
    const [newSpawnedPage] = await Promise.all([ //When these two "future" actions complete return the new page fixture
      context.waitForEvent('page'),
      page.locator("#right-column > a[onclick='return popUpWindow();']").click()
    ])

    await page.waitForTimeout(2000); //Thread.sleep(2000);


    const closeBtn = newSpawnedPage.getByRole('link', { name: 'Close Window' }); //closes the newly opened popup //Not working in Firefox?
    await closeBtn.click();

    await page.getByRole('link', { name: 'Load Content' }).click();

  })
})


test('value appears exactly once in array', () => {
  const array = ['1', '2', '3', '4', '5'];
  const value = '2';

  const occurrences = array.filter(item => item === value).length;
  expect(occurrences).toBe(1);
  expect(array).toContainEqual('2') //Only checks if '2' is in array - not if it appears more than once

});
