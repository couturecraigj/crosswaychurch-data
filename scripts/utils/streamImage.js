const download = require('./download');

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