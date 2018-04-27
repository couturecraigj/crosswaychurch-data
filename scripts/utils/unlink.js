const { promisify } = require('util');
const fs = require('fs')
const unlinkAsync = promisify(fs.unlink)

module.exports = unlinkAsync;