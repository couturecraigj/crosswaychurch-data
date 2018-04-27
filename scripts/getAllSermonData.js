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
const getSermonCategories = require('./getSermonCategories')
const cleanDownloads = require('./utils/cleanDownloads')
const request = require('request');
const path = require('path');
const downloadsFinished = require('./utils/waitUntilDownloadFinished')

const mainPage = 'http://www.keenecrossway.org';

(async () => {

  await cleanDownloads()
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
    /**
     * THIS DOWNLOADS EACH FILE ONE BY ONE
     * because CHROMIUM DOES NOT ALLOW YOU TO
     * CANCEL THE DOWNLOADS ONCE YOU HAVE THE NAME
     */
    const dataFile = await Promise.all([
      // Comment one out if you are only looking to do Audio or video
      handleAudio(audio, mainUrl, browser, { pageNumber, mainUrl }),
      handleVideo(video, mainUrl, browser, { pageNumber, mainUrl })
    ]).then(data => data.reduce((p, c) => ([...p, ...c]), []));

    await page.close();
    return dataFile;
  }
  let downloads = require('../downloads.json');

  /**
   * In case you are not using good Version Control
   * and hit an error the old version should
   * be saved in the temp folder
   */
  try {
    fs.mkdirSync('temp')
  } catch (error) {

  }
  fs.writeFileSync(`temp/${new Date().toISOString()}-downloads.json`, JSON.stringify(downloads), 'utf-8')
  /**
   * Change Pages to include the Pages you want to adjust to.
   */
  for (let i = 6; i > 4; i--) {
    // Currently the oldest Page is 37
    downloads = downloads.concat(await handlePage(i));
  }
  /**
   * The Category does not seem to be on the Sermon List page so we need to go through manually
   * to each URL and grab the category from there.
   */
  downloads = await getSermonCategories(downloads, browser)
  // Write File to the File System
  await save(downloads, 'downloads.json')
  // console.log(downloads);
  await browser.close();
})();

