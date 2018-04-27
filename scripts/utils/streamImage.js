const download = require('./download');
const path = require('path')
const fs = require('fs')

const streamImage = (src) => {
  return new Promise(async (resolve) => {
    if (!src) return resolve(src);
    const localPath = /([^\/]*)$/.exec(src)[0]
    try {
      fs.mkdirSync('assets')
    } catch (error) {

    }
    try {
      await download(src, path.join('assets', localPath));
    } catch (error) {
      return resolve(localPath);
    }

    return resolve(localPath);
  })
}

module.exports = streamImage
