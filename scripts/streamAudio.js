const downloads = require('../downloads.json');
const downloadAsync = require('./utils/download')

const batches = 5;

(async () => {
  for (let batch of downloads
    .filter(({ type }) => type === 'audio')
    .map((value, index, array) => array.filter((v, i) => i >= index && i < index + batches))
    .filter((value, index) => index % batches === 0)
    // Comment this out once confident with streams
    .filter((value, index) => [0, 3].includes(index))
  ) {
    await Promise.all(batch.map(({ filename }) => downloadAsync(filename)))
  }
})()


  // .forEach((values, i, arr) => i === arr.length - 1 ? console.log(values) : null)