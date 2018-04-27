const puppeteer = require('puppeteer');
const fs = require('fs');
const request = require('request');
const path = require('path');
const { promisify } = require('util');
const readdirAsync = promisify(fs.readdir)
const unlinkAsync = promisify(fs.unlink)

const download = function (uri, filename) {
  return new Promise(async (resolve, reject) => {
    const dir = await readdirAsync('./')
    if (dir.includes(filename)) return resolve();
    const stream = request(uri);

    stream.on('error', reject)
    const wStream = fs.createWriteStream(filename)
    wStream.on('finish', resolve)
    stream.on('finish', resolve)
    stream.pipe(wStream)
  })
};

const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const downloadsFinished = async (dir) => {
  let timeout
  let filename
  let ranThrough = false;

  const checkingFunction = (resolve, reject) => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      const files = await readdirAsync(dir);
      const file = files.find(file => /.crdownload/.test(file));
      // if (file && files.includes(file.replace(/.crdownload/, ''))) {
      //   await unlinkAsync(file)
      //   return resolve(file.replace(/.crdownload/, ''))
      // }
      if (!filename && !file && !ranThrough) {
        ranThrough = true;
        checkingFunction(resolve, reject);
      }
      if (!filename && !file && ranThrough) reject(new Error('Could not find a download'));
      if (filename && !file) resolve(filename);
      if (!filename && file) filename = file.replace(/.crdownload/, '');
      if (filename && file) checkingFunction(resolve, reject);
      ranThrough = true
    }, 100)
  }
  await pause(1000);
  return new Promise((resolve, reject) => {
    checkingFunction(resolve, reject)
  })
}

const streamImage = (src) => {
  return new Promise(async (resolve) => {
    if (!src) return resolve(src);
    const localPath = /([^\/]*)$/.exec(src)[0]
    try {
      await download(src, localPath);
    } catch (error) {
      return resolve(localPath);
    }

    return resolve(localPath);
  })
}

const mainPage = 'http://www.keenecrossway.org';

(async () => {
  const files = await readdirAsync('./');
  files.forEach(async file => {
    if (/.crdownload/.test(file)) await unlinkAsync(path.join('./', file))
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
    const handleAudio = async (audioLinks, url) => {
      const audioPage = await browser.newPage();
      await audioPage.goto(url)
      const client = await audioPage.target().createCDPSession();
      await client.send('Page.setDownloadBehavior', {
        behavior: 'allow', downloadPath: './'
      });

      const dataFile = await audioLinks.reduce((promise, selector) => promise.then(async (array) => {
        await audioPage.click(selector)

        // await pause(000);
        const filename = await downloadsFinished('./').catch(async (e) => {
          console.log(e);
          await audioPage.goto(mainUrl, { waitUntil: 'domcontentloaded' });
          return;
        })
        const data = await audioPage.evaluate(query => {
          // console.log(window.experimental);
          result = {};
          const ele = document.querySelector(query);
          const elements = [...ele.parentElement.parentElement.children]

          const content = elements.filter(v => v.tagName === 'P' && v.className !== 'media')[0]
          try {
            result.title = elements.filter(v => v.tagName === 'H1')[0].children[0].innerHTML
            result.url = elements.filter(v => v.tagName === 'H1')[0].children[0].href
          } catch (e) {
            //
          }
          try {
            result.img = elements.filter(ele => ele.tagName === 'A' && ele.className === 'series')[0].lastChild.src
          } catch (e) {
            //
          }
          try {
            result.dateTime = content.children[0].dateTime
          } catch (e) {
            //
          }
          try {
            result.speaker = content.children[2].innerHTML
          } catch (e) {
            //
          }
          try {
            result.series = content.children[5].innerHTML
          } catch (e) {
            //
          }
          try {
            result.verses = content.children[7].children[0].innerText
          } catch (e) {
            //
          }

          return result
        }, selector)
        // Append https://churchplantmedia-cms.s3.amazonaws.com/crossway_church_keene/ to each to get a direct download
        data.filename = filename;
        data.pageNumber = pageNumber;
        data.type = 'audio';
        data.listUrl = mainUrl;
        data.img = await streamImage(data.img);
        console.log(data);

        array.push(data);
        return array;
      }), Promise.resolve([])).catch(async e => {
        console.log(e);
        await audioPage.goto(mainUrl, { waitUntil: 'domcontentloaded' });
        return;
      })
      await audioPage.close()
      return dataFile;
    }
    // Grab Information from Audio Separately from Video
    const handleVideo = async (videoLinks, url) => {
      const videoPage = await browser.newPage();
      await videoPage.goto(url)
      const dataFile = await videoLinks.reduce((promise, selector) => promise.then(async (array) => {

        await pause(1000);

        const data = await videoPage.evaluate(query => {
          result = {};
          console.log(query);
          const ele = document.querySelector(query);
          result.filename = ele.href;
          const elements = [...ele.parentElement.parentElement.children]

          const content = elements.filter(v => v.tagName === 'P' && v.className !== 'media')[0]
          try {
            result.title = elements.filter(v => v.tagName === 'H1')[0].children[0].innerHTML
            result.url = elements.filter(v => v.tagName === 'H1')[0].children[0].href
          } catch (e) {
            //
          }
          try {
            result.img = elements.filter(ele => ele.tagName === 'A' && ele.className === 'series')[0].lastChild.src
          } catch (e) {
            //
          }
          try {
            result.dateTime = content.children[0].dateTime
          } catch (e) {
            //
          }
          try {
            result.speaker = content.children[2].innerHTML
          } catch (e) {
            //
          }
          try {
            result.series = content.children[5].innerHTML
          } catch (e) {
            //
          }
          try {
            result.verses = content.children[7].children[0].innerText
          } catch (e) {
            //
          }

          return result
        }, selector)
        // data.filename = filename;
        data.pageNumber = pageNumber;
        data.listUrl = mainUrl;
        data.img = await streamImage(data.img);

        await videoPage.goto(data.filename, { waitUntil: 'domcontentloaded' })
        await pause(1000);
        const wrapper = await videoPage.$('#video-info div.videoinner iframe');
        data.type = 'video';
        data.filename = await videoPage.evaluate(ele => {
          console.log(ele)
          return ele.src;
        }, wrapper)
        await videoPage.goto(mainUrl, { waitUntil: 'domcontentloaded' })
        array.push(data);
        return array;
      }), Promise.resolve([])).catch(async e => {
        console.log(e);
        await videoPage.goto(mainUrl, { waitUntil: 'domcontentloaded' });
        return;
      })
      await videoPage.close();
      return dataFile;
    }
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

    const dataFile = await Promise.all([
      // Comment one out if you are only looking to do Audio or video
      handleAudio(audio, mainUrl),
      handleVideo(video, mainUrl)
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
  // try {
  //   fs.mkdirSync('temp')
  // } catch (error) {

  // }
  // fs.writeFileSync(`temp/${new Date().toISOString()}-downloads.json`, JSON.stringify(downloads), 'utf-8')
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
  // downloads = downloads.map(download => {
  //   if (download.filename)
  //     download.filename = `https://churchplantmedia-cms.s3.amazonaws.com/crossway_church_keene/${download.filename}`
  //   return download;
  // })
  // Write File to the File System
  fs.writeFileSync('downloads.json', JSON.stringify(downloads), 'utf-8')
  // console.log(downloads);
  await browser.close();
})();

