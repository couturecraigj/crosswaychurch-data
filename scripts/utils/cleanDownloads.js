const path = require('path')
const unlink = require('./unlink')
const readdir = require('./readdir')

const cleanDownloads = async (dir = 'downloads') => {
  const files = await readdir(dir);
  files.forEach(async file => {
    if (/.crdownload/.test(file)) await unlink(path.join(dir, file))
  })
}

module.exports = cleanDownloads;
