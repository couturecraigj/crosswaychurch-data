const downloads = require('../downloads.json');
const save = require('./utils/saveJson')
const downloadAsync = require('./utils/download')

const batchSize = 8;

(async () => {
  let batches = downloads
    .filter(({ type }) => type === 'audio')
    .map((value, index, array) => array.filter((v, i) => i >= index && i < index + batchSize))
    .filter((value, index) => index % batchSize === 0)
  // Comment this out once confident with streams
  // .filter((value, index) => [0, 3].includes(index))

  for (let batch of batches) {
    await Promise.all(batch.map(({ filename }) => downloadAsync(filename)))
  }

})()





  // .forEach((values, i, arr) => i === arr.length - 1 ? console.log(values) : null)