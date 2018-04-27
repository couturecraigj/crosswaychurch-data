const browser = chrome;
browser.runtime.getManifest();
// console.log(browser.permissions.getAll());

(async () => {
  // console.log(browser.runtime.getManifest().version)
  console.log(chrome)
  // setInterval(async () => {
  //   const downloads = await chrome.experimental.downloads.search({
  //     filenameRegex: /.crdownload/
  //   })
  //   downloads.forEach(async ({ id }) => {
  //     await chrome.experimental.downloads.cancel(id)
  //     return
  //   })
  //   console.log(downloads)
  // }, 100)
})()

