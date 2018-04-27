const handleAudio = async (audioLinks, url, browser) => {
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

module.exports = handleAudio;
