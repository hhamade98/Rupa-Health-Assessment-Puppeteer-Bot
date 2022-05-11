const puppeteer = require('puppeteer');
require('dotenv').config();

const login = process.env.rootUrl;
const home = process.env.homeUrl;
const checkout = process.env.checkoutUrl;

describe('Rupa Health Assessment Testing', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });
    page = await browser.newPage();
  });

  beforeEach(async () => {
    await page.goto(login);
  });

  afterAll(async () => {
    browser.close();
  });

  /**
   * @param - {}
   * @returns - {}
   * @description - Logs in user credentials and goes to home page after successful login
   */
  const logIn = async () => {
    await page.waitForSelector('#input-email');
    await page.focus('#input-email');
    await page.keyboard.type(process.env.username);
    await page.waitForSelector('#input-password');
    await page.focus('#input-password');
    await page.keyboard.type(process.env.password);

    await Promise.all([
      page.click('input[value ="Login"]'),
      page.waitForNavigation(),
    ]);

    await page.goto(home);
  };

  /**
   * @params - {}
   * @returns - {}
   * @description - Adds a product to the cart
   */
  const addToCart = async () => {
    await page.waitForSelector('.product-thumb');
    await page.evaluate(() => {
      const tool = [...document.querySelectorAll('.product-thumb')].filter(
        (elem) => elem.innerText.includes('MacBook')
      );
      const button = tool[0].childNodes[5].childNodes[1];
      button.click();
    });
  };

  xdescribe('Initial Display', () => {
    xit('loads successfully', async () => {
      //tests the initial loadup of the browser
      await page.waitForSelector('#logo');
      const loadUp = await page.$eval('#logo', (el) => el.innerText);

      expect(loadUp).toContain('Your Store');
    });

    xit('logs in successfully', async () => {
      //tests the login functionality
      await page.waitForSelector('#input-email');
      await page.focus('#input-email');
      await page.keyboard.type(process.env.username);
      await page.waitForSelector('#input-password');
      await page.focus('#input-password');
      await page.keyboard.type(process.env.password);
      await page.waitForSelector('input[value ="Login"]');

      await Promise.all([
        page.$eval('input[value ="Login"]', (form) => form.click()),
        page.waitForNavigation(),
      ]);

      await page.waitForSelector('#content');
      const loginCheck = await page.$eval('#content', (el) => el.innerText);
      expect(loginCheck).toContain('My Account');
    });
  });

  xdescribe('User Interaction & Data Flow Testing', () => {
    xit('adds item to cart', async () => {
      //tests adding to cart functionality
      await logIn();

      const initialCart = await page.$eval('#cart', (el) => el.innerText);
      expect(initialCart).toContain('0 item(s)');

      await page.waitForSelector('.product-thumb');
      await page.evaluate(() => {
        const tool = [...document.querySelectorAll('.product-thumb')].filter(
          (elem) => elem.innerText.includes('MacBook')
        );

        const button = tool[0].childNodes[5].childNodes[1];
        button.click();
      });

      await page.waitForTimeout(3000);
      const finalCart = await page.$eval('#cart', (el) => el.innerText);
      expect(finalCart).toContain('1 item(s)');
    }, 5000);

    xit('checks out the items', async () => {
      //tests the purchase of a populated cart
      await logIn();
      await addToCart();

      await page.click(`a[href='${checkout}']`);
      await page.waitForSelector('.radio');
      await page.evaluate(() => {
        const tool = [...document.querySelectorAll('.radio')].filter((elem) =>
          elem.innerText.includes('new')
        );
        const button = tool[0].childNodes[1].childNodes[1];
        button.click();
      });

      await page.waitForTimeout(800);
      await page.type('#input-payment-firstname', 'Firstname');
      await page.type('#input-payment-lastname', 'Lastname');
      await page.type('#input-payment-address-1', '444 Mock Street');
      await page.type('#input-payment-city', 'Cambridge');
      await page.type('#input-payment-postcode', '02141');

      await page.select('#input-payment-country', '223');
      await page.waitForTimeout(500);
      await page.waitForSelector('#input-payment-zone');
      await page.select('#input-payment-zone', '3644');

      await page.click('#button-payment-address');
      await page.waitForTimeout(800);

      await page.waitForSelector('textarea[name="comment"]');
      await page.type(
        'textarea[name="comment"]',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      );

      await page.waitForSelector('input[name="agree"]');
      await page.click('input[name="agree"]');
      await page.waitForSelector('#button-payment-method');
      await page.click('#button-payment-method');
      await page.waitForTimeout(800);

      // await page.screenshot({
      //   path: './screenshot5.png',
      //   fullPage: true,
      // });
      // I left one example of a screenshot I used to debug the functionality

      await page.waitForSelector('.table-responsive');
      const finalCart = await page.$$eval('tr', (el) => el[4].innerText);
      expect(finalCart).toContain('MacBook');

      await Promise.all([
        page.click('#button-confirm'),
        page.waitForNavigation(),
      ]);
      const check = await page.$eval('#content', (x) => x.innerText);
      expect(check).toContain('Your order has been placed!');
    }, 8000);
  });
});
