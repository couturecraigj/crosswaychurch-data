const pause = require('./utils/pause')
const streamImage = require('./utils/streamImage')

const handleVideo = async (videoLinks, url, browser, { pageNumber, mainUrl } = {}) => {
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
    console.log(data);
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

module.exports = handleVideo;
