const fs = require('fs');

const save = (file, name) =>
  fs.writeFileSync(name, JSON.stringify(file), 'utf-8')

module.exports = save;