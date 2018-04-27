const readdir = require('./readdir')
const request = require('request');
const fs = require('fs')

const download = function (uri, filename = 'downloads/' + /([^\/]*)$/.exec(uri)[0]) {
  return new Promise(async (resolve, reject) => {
    const dir = await readdir('downloads/')
    if (dir.includes(filename.replace('downloads/', ''))) return resolve();
    const stream = request(uri);

    stream.on('error', reject)
    const wStream = fs.createWriteStream(filename)
    wStream.on('finish', resolve)
    stream.on('finish', resolve)
    stream.pipe(wStream)
  })
};

module.exports = download;