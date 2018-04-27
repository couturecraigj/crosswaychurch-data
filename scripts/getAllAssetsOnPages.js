const puppeteer = require('puppeteer');
const fs = require('fs');
const mime = require('mime');
const URL = require('url').URL;

try {
  fs.mkdirSync('assets');
} catch (e) {
  console.error(e);
}

const pages = [
  'http://www.keenecrossway.org/',
  'http://www.keenecrossway.org/vision',
  'http://www.keenecrossway.org/pastors',
  'http://www.keenecrossway.org/pastoral-assistants',
  'http://www.keenecrossway.org/beliefs',
  'http://www.keenecrossway.org/priorities',
  'http://www.keenecrossway.org/core-values',
  'http://www.keenecrossway.org/distinctives',
  'http://www.keenecrossway.org/faqs',
  'http://www.keenecrossway.org/sermons',
  'http://www.keenecrossway.org/who-is-jesus',
  'http://www.keenecrossway.org/what-is-a-christian',
  'http://www.keenecrossway.org/why-the-church',
  'http://www.keenecrossway.org/believers-baptism',
  'http://www.keenecrossway.org/membership',
  'http://www.keenecrossway.org/directory',
  'http://www.keenecrossway.org/blog',
  'http://www.keenecrossway.org/blog/post/how-to-love-god-and-others',
  'http://www.keenecrossway.org/blog/post/practical-suggestions-for-your-prayer-life',
  'http://www.keenecrossway.org/blog/post/what-is-god-up-to-in-your-suffering',
  'http://www.keenecrossway.org/blog/post/walk-in-christ-just-as-you-received-him',
  'http://www.keenecrossway.org/books',
  'http://www.keenecrossway.org/links',
  'http://www.keenecrossway.org/children',
  'http://www.keenecrossway.org/vbs',
  'http://www.keenecrossway.org/teens',
  'http://www.keenecrossway.org/abf',
  'http://www.keenecrossway.org/home-fellowships',
  'http://www.keenecrossway.org/biblical-counseling',
  'http://www.keenecrossway.org/the-adoption-fund',
  'http://www.keenecrossway.org/basketball',
  'http://www.keenecrossway.org/contact-us',
  'http://www.keenecrossway.org/events/event/17/men:-theology-for-breakfast/2016-05-03',
  'http://www.keenecrossway.org/events/event/4/fellowship-meal/2013-01-06',
  'http://www.keenecrossway.org/events',
  'http://www.keenecrossway.org/map',
  'http://www.keenecrossway.org/about'
];

(async (urls) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const responses = [];
  page.on('response', resp => {
    responses.push(resp);
  });

  page.on('load', () => {
    responses.map(async (resp, i) => {
      const request = await resp.request();
      const url = new URL(request.url());
      const split = url.pathname.split('/');
      let filename = split[split.length - 1];
      if (!filename) filename += 'index'
      if (!filename.includes('.')) {

        filename += '.html';
      }

      const buffer = await resp.buffer();
      fs.writeFileSync('assets/' + filename, buffer);
    });
  });
  for (let link of urls) {
    await page.goto(link, { waitUntil: 'networkidle0' });
  }

  browser.close();
})(pages);