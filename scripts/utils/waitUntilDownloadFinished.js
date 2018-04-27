const readdir = require('./readdir')
const pause = require('./pause')

const downloadsFinished = async (dir, ms = 1000) => {
  let timeout
  let filename
  let ranThrough = false;

  const checkingFunction = (resolve, reject) => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      const files = await readdir(dir);
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
  await pause(ms);
  return new Promise((resolve, reject) => {
    checkingFunction(resolve, reject)
  })
}

module.exports = downloadsFinished;
