const puppeteer = require('puppeteer');
const order = require('./order.json');
require('dotenv').config();

const login = process.env.rootUrl;
const home = process.env.homeUrl;
const checkout = process.env.checkoutUrl;
const canon = process.env.canonUrl;
const output = [];

const states = { //a object created to store all select form option values to properly select a state
  MA: '3644',
  TX: '3669',
  PA: '3663',
};


/**
 * @param - {}
 * @returns - {Array[Object]} output
 * @description - IIFE that contains inner functions to modularize the bots actions and make it more readable
*/
(async () => { 
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
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
   * @param - {string} item
   * @returns - {}
   * @description - After finding the item from the search bar, it adds the item to the cart 
  */
  const addToCart = async (item) => {
    console.log('addToCart: ', item);
    if(item.includes('Canon EOS 5D')){ //canon is special since you have to select a color
      await page.goto(canon);
      await page.select('#input-option226', '15');
      await page.waitForSelector('#button-cart');
      await page.click('#button-cart');
      await page.waitForTimeout(600);
    } else {
      await page.waitForSelector('.product-thumb');
      await page.evaluate(() => {
        const tool: Array<any> = [...document.querySelectorAll('.product-thumb')];
  
        const button: any = tool[0].childNodes[3].childNodes[3].childNodes[1];
        button.click();
      });
    }
  };

  /**
   * @param - {string} item
   * @returns - {}
   * @description - Searches for the item using the search bar 
  */
  const goToItem = async (item) => {
    console.log('goToItem: ', item);
    await page.type('input[name="search"]', item);
    await Promise.all([
      page.click('.btn.btn-default.btn-lg'),
      page.waitForNavigation(),
    ]);
  };

  /**
   * @param - {string} firstname
   * @param - {string} lastname
   * @param - {string} address
   * @param - {string} city
   * @param - {string} state
   * @param - {string} zip
   * @param - {string} delNotes
   * @param - {string} payMethod
   * @param - {string} payNotes
   * @param - {number} i
   * @returns - {}
   * @description - takes a populated cart and fills out the necessary customer data to finalize a purchase
  */
  const purchase = async (
    firstname,
    lastname,
    address,
    city,
    state,
    zip,
    delNotes,
    payMethod,
    payNotes,
    i
  ) => {
    await page.click(`a[href='${checkout}']`);

    await page.waitForSelector('.radio');
    await page.evaluate(() => {
      const tool = [...document.querySelectorAll('.radio')].filter((elem: any) =>
        elem.innerText.includes('new')
      );
      const button: any = tool[0].childNodes[1].childNodes[1];
      button.click();
    });

    await page.waitForTimeout(200);
    await page.type('#input-payment-firstname', firstname);
    await page.type('#input-payment-lastname', lastname);
    await page.type('#input-payment-address-1', address);
    await page.type('#input-payment-city', city);
    await page.type('#input-payment-postcode', zip);

    await page.select('#input-payment-country', '223'); //all the orders were in the United States
    await page.waitForTimeout(200); //gives the select form time to update the states select form to render its options
    await page.waitForSelector('#input-payment-zone');
    await page.select('#input-payment-zone', states[state]);
    await page.waitForTimeout(200);

    await page.click('#button-payment-address');
    await page.waitForTimeout(1000);

    const fullAddress =
      firstname + ' ' + lastname + ', ' + address + ', ' + city;

    const addressCheck = await page.evaluate((fullAddress) => {
      console.log(fullAddress);
      const tool = [...document.querySelectorAll('option')].filter((elem) =>
        elem.innerText.includes(fullAddress)
      )[0];

      return tool.value;
    }, fullAddress);

    await page.select('#shipping-existing :nth-child(1)', addressCheck);
    await page.waitForTimeout(400);

    await page.waitForSelector('#button-shipping-address');
    await page.click('#button-shipping-address');
    await page.waitForTimeout(2000);

    await page.waitForSelector('textarea');
    if (delNotes) await page.type('textarea', delNotes); //delivery notes can be null

    await page.click('#button-shipping-method');
    await page.waitForTimeout(500);

    if (payMethod === 'Cash') {
      await page.waitForSelector('.radio');
      await page.evaluate(() => {
        const tool = [...document.querySelectorAll('.radio')].filter((elem: any) =>
          elem.innerText.includes('Cash')
        );
        const button: any = tool[0].childNodes[1].childNodes[1];
        button.click();
      });
    }
    await page.waitForTimeout(500);

    if (payNotes) {
      //payment notes can be null
      await page.type(
        '#collapse-payment-method > div > p:nth-child(5) > textarea',
        payNotes
      );
    }

    await page.waitForSelector('input[name="agree"]');
    await page.click('input[name="agree"]');
    await page.waitForSelector('#button-payment-method');
    await page.click('#button-payment-method');
    await page.waitForTimeout(2000);

    await page.screenshot({ //a screenshot of the last step in purchasing a cart
      path: `./finalCartScreenshot${i}.png`,
      fullPage: true,
    });

    await Promise.all([
      page.click('#button-confirm'),
      page.waitForNavigation(),
    ]);

    await Promise.all([
      page.click('#content > p:nth-child(3) > a:nth-child(2)'),
      page.waitForNavigation(),
    ]);

    console.log('Purchase complete!');
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  try {
    await page.goto(login);
    await logIn();
    for (let i = 0; i < order.length; i++) {
      const currOrd = order[i];
      const {
        orderId,
        customerFirstName,
        customerLastName,
        customerAddress,
        customerCity,
        customerState,
        customerZip,
        deliveryNotes,
        paymentMethod,
        paymentNotes,
        items,
      } = currOrd;
      for (let j = 0; j < items.length; j++) {
        const currItem = items[j];
        await goToItem(currItem.itemName);
        await addToCart(currItem.itemName);
        await page.goto(home);
      }
  
      console.log('Time to buy!');
  
      await purchase(
        customerFirstName,
        customerLastName,
        customerAddress,
        customerCity,
        customerState,
        customerZip,
        deliveryNotes,
        paymentMethod,
        paymentNotes,
        i
      );
  
      const externalOrderId = await page.evaluate(() => {
        return [...document.querySelectorAll('td')][7].innerText;
      });
  
      output.push({ orderId: orderId, externalOrderId: externalOrderId });
      console.log(output);
      await page.goto(home);
    }
    await browser.close();
    return output;
  } catch (err) {
    console.error(err);
  }
})();
