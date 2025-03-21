import { Page, Locator } from '@playwright/test';

export class HomePOM {
    //Fields that methods can access
    page: Page;
    loginLink: Locator;

    constructor(page: Page){
        this.page = page;
        //Locators - fields must be populated when exiting the constructor in JS/TS class syntax
        this.loginLink = page.getByRole('link', { name: 'Login To Restricted Area' });
    }

    //Service methods
    async goLogin(){await this.loginLink.click()};
}