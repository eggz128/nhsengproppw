import{test,expect} from '@playwright/test';

test.beforeAll(async ()=>{
    console.log("Set up user for these tests on the backend database")
})

test.afterAll(async ()=>{
    console.log("Remove the user from the backend database")
})

test.beforeEach(async ({ page }) => {
    console.log('login now')
})

test.afterEach(async ({ page }) => {
    console.log('logout now')
})

test('A test', async ({ page }) => {
    console.log('A test')
})

test('Another test', async ({ page }) => {
    console.log('Another test')
})