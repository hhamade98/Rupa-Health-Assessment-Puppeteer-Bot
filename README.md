# Rupa Health Automation Bot Assessment

Puppeteer Automation Bot that parses through JSON metadata and simulates orders.

# Table of Contents

- [Introduction](#introduction)

- [Dependencies](#dependencies)

- [How to Use the Bot](#how-to-use-the-bot)

- [Reflection](#reflection)

- [Author](#author)

## Introduction

Rupa Health uses Puppeteer for the automation of ordering from partner labs. By using an automation bot, a piece of JSON metadata can be consumed and parsed in a way that the bot can place orders. This automation helps speed up a process that would take many individuals to do manually.

## Dependencies

The Puppeteer automation bot is built using these dependencies:

- [NodeJS - v16.13.0](https://nodejs.org/en/)

- [NPM - v8.3.0](https://www.npmjs.com/)

- [Puppeteer - v13.7.0](https://github.com/puppeteer/puppeteer)

- [Jest - v28.0.03](https://jestjs.io/)

- [Dotenv -v16.0.0](https://www.npmjs.com/package/dotenv)

- [TypeScript - v4.6.4](https://www.typescriptlang.org/)

- [TSLib - v2.4.0](https://www.npmjs.com/package/tslib)

- [TS-Node -v10.7.0](https://www.npmjs.com/package/ts-node)

- [@types/puppeteer -v5.4.6](https://www.npmjs.com/package/@types/puppeteer)

- [@types/node -v17.0.31](https://www.npmjs.com/package/@types/node)

## How to Use the Bot

<br />
<b>1. Clone this repo.</b>

If using [Git](https://git-scm.com/), run:

```
git clone https://github.com/hhamade98/Rupa-Health-Assessment-Puppeteer-Bot.git

cd Rupa-Health-Assessment-Puppeteer-Bot
```

<br />
<b>2. Install dependencies.</b>

```
npm install
```

<br />
<b>3. Run testing script.</b><br />

Testing was built using Puppeteer and Jest. In order to run the test cases, run this command. _Please note that an empty cart on the website and a .env file are necessary to see accurate results._

```
npm run test
```

<br />

<b>4. Run bot script.</b><br />

To run the bot, execute the following command in your terminal. _Please note that an empty cart on the website and a .env file are necessary to see accurate results._

```
npx ts-node bot.ts
```

## Reflection

I spent around a week working on this automation bot. It was really exciting using Puppeteer to jump around a website and mimic human activity. Having mostly used unit testing in my day-to-day tasks, I found that diving into headless browser testing using Puppeteer dramatically widened my ability to test applications. During the process of completing the assessment, I refreshed on my Puppeteer skills and shook the rust off, but also felt the need to improve upon them as well. With use of the screenshot functionality to assist the debugging process, I had so much more fun because it was different than my other testing experiences.

By pairing both Puppeteer and Jest, I was able to maximize testing suites and improve the modularity of my code. I made use of TDD (Test-Driven-Development) to help complete this assessment by first building the tests cases and then the bot after. Once test cases passed, mapping out the bot functionality became a lot simpler and the quality of the code increased. An area that can be improved was adding the Canon Camera item to the cart. This item was unique because it needed a color to be chosen before it can be added to the cart. Creating a separate function to enhance the modularity of the code would have been the most ideal route to take. However, time was a constraining factor and it was the only item under this use-case, I took a less than ideal way to fix it.

## Author

Hussein Hamade [Github](https://github.com/hhamade98) | [LinkedIn](https://www.linkedin.com/in/husseinhamade1/) <br>
