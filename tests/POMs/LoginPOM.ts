import { Page, Locator } from '@playwright/test';

export class LoginPOM {
    //Fields that methods can access
    page: Page;
    readonly usernameField: Locator;
    passwordField: Locator;
    submitButton: Locator;
    

    constructor(page: Page){
        this.page = page;
        //Locators - fields must be populated when exiting the constructor in JS/TS class syntax
        this.usernameField = page.getByRole('row', { name: 'User Name?' }).locator('#username');
        this.passwordField = page.locator('#password');
        this.submitButton = page.getByRole('link', { name: 'Submit' })
        
    }

    //Service methods
    async fillUsername(username: string){
        await this.usernameField.fill(username)
        //return this; //Attempts to create a nice chainable API doint really work in async/await land
    }

    async fillPassword(password: string){
        await this.passwordField.click()
        await this.passwordField.pressSequentially(password, {delay: 750, timeout: 10000})
        //return this; //Just seperately "await" each of these methods
    }

    async submitForm(){
        await this.submitButton.click();
    }

    //Higher level helpers
    async login(username: string, password: string){
        await this.fillUsername(username);
        await this.fillPassword(password);
        await this.submitForm();
    }

}