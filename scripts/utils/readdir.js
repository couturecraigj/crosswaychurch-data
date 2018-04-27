const { promisify } = require('util');
const fs = require('fs')
const readdirAsync = promisify(fs.readdir)

module.exports = readdirAsync;