const downloads = require('../downloads.json')
const save = require('./utils/saveJson')

const result = downloads.map(file => {

  file.localPath = 'downloads/' + /([^\/]*)$/.exec(file.filename)[0]
  return file;
})

save(result, 'downloads.json')

console.log(result)