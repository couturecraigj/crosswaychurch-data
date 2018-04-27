const getCategories = async (downloads, browser) => {
  const page = await browser.newPage();
  downloads = await downloads.reduce((promise, download) => promise.then(async arr => {
    await page.goto(download.url, { waitUntil: 'domcontentloaded' });
    const wrapper = await page.$('#sermonlist p:not(.media) a[href*="category"]'); // document.querySelector('#sermonlist p:not(.media) a[href*="category"]')
    download.category = await page.evaluate(ele => ele ? ele.innerText : undefined, wrapper);
    console.log(download.category);
    arr.push(download);
    return arr;
  }), Promise.resolve([]))
  await page.close();
}

module.exports = getCategories
