/**
 * YOU SHOULD NOT NEED THIS IT IS ONLY HELD ON TO FOR HISTORICAL PURPOSES
 */
const puppeteer = require('puppeteer');
const handleVideo = require('./getAllVideoFromPage')
const handleAudio = require('./getAllAudioFromPage')
const fs = require('fs');
const download = require('./utils/download')
const pause = require('./utils/pause')
const save = require('./utils/saveJson')
const streamImage = require('./utils/streamImage')
const readdir = require('./utils/readdir')
const unlink = require('./utils/unlink')
const request = require('request');
const path = require('path');
const downloadsFinished = require('./utils/waitUntilDownloadFinished')

const mainPage = 'http://www.keenecrossway.org';

(async () => {
  const files = await readdir('./');
  files.forEach(async file => {
    if (/.crdownload/.test(file)) await unlink(path.join('./', file))
  })

  const browser = await puppeteer.launch({
    headless: false, devtools: true, args: [
      '--disable-extensions-except=./extensions/cancel-downloads',
      '--load-extension=./extensions/cancel-downloads',
      '--enable-experimental-extension-apis'
    ]
  });

  // Handle Each Page separately
  const handlePage = async (pageNumber) => {

    const page = await browser.newPage();
    // Grab Information from Audio Separately from Video

    // Grab Information from Audio Separately from Video

    const mainUrl = `${mainPage}/sermons/page/${pageNumber}`
    await page.goto(mainUrl, { waitUntil: 'domcontentloaded' });

    // await page.waitForNavigation();
    const audio = await page.evaluate((url) => {
      const links = [
        ...document.querySelectorAll('p.media a.download')
      ]
        .map(link => link.getAttribute('href'))
      return links.map(link => `a[href="${link}"]`);
    }, mainPage);

    const video = await page.evaluate((url) => {
      const links = [
        ...document.querySelectorAll('p.media a.watch')
      ]
        .map(link => link.getAttribute('href'))
      return links.map(link => `a[href="${link}"]`);
    }, mainPage);
    // THIS DOWNLOADS EACH FILE ONE BY ONE CHROMIUM DOES NOT ALLOW YOU TO CANCEL THE DOWNLOADS ONCE YOU HAVE THE NAME
    const dataFile = await Promise.all([
      // Comment one out if you are only looking to do Audio or video
      handleAudio(audio, mainUrl, browser),
      handleVideo(video, mainUrl, browser)
    ]).then(data => data.reduce((p, c) => ([...p, ...c]), []));

    await page.close();
    return dataFile;
  }
  let downloads = require('../downloads.json');

  downloads.map(download => {
    if (download.type === 'audio') return download;
    if (download.type === 'video') download.filename = download.filename.replace('https://churchplantmedia-cms.s3.amazonaws.com/crossway_church_keene/', '')
    return download;
  })


  /**
   * In case you are not using good Version Control and hit an error the old version should be saved in the temp folder
   */
  try {
    fs.mkdirSync('temp')
  } catch (error) {

  }
  fs.writeFileSync(`temp/${new Date().toISOString()}-downloads.json`, JSON.stringify(downloads), 'utf-8')
  // // Comment out if just appending missed Items
  // downloads = [];
  // // Did not realize that there were audio and video
  // // downloads = downloads.map((v) => Object.assign({}, v, { type: 'audio' }))
  // for (let i = 37; i > 0; i--) {
  //   // Currently the oldest Page is 37
  //   downloads = downloads.concat(await handlePage(i));
  // }
  /**
   * The Category does not seem to be on the Sermon List page so we need to go through manually
   * to each URL and grab the category from there.
   */
  // const page = await browser.newPage();
  // downloads = await downloads.reduce((promise, download) => promise.then(async arr => {
  //   await page.goto(download.url, { waitUntil: 'domcontentloaded' });
  //   const wrapper = await page.$('#sermonlist p:not(.media) a[href*="category"]'); // document.querySelector('#sermonlist p:not(.media) a[href*="category"]')
  //   download.category = await page.evaluate(ele => ele ? ele.innerText : undefined, wrapper);
  //   console.log(download.category);
  //   arr.push(download);
  //   return arr;
  // }), Promise.resolve([]))
  // await page.close();
  /**
   * After Getting the filename we need to make sure that we have the URL to download the file
   */
  // downloads = downloads
  // .map(download => {
  //   if (download.filename && download.type === 'audio')
  //     download.filename = `https://churchplantmedia-cms.s3.amazonaws.com/crossway_church_keene/${download.filename}`
  //   return download;
  // })
  // Write File to the File System
  await save(downloads, 'downloads.json')
  // console.log(downloads);
  await browser.close();
})();

