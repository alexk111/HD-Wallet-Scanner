const fs = require('fs')

const dirOutput = 'output'

if (!fs.existsSync(dirOutput)) {
  fs.mkdirSync(dirOutput)
}

module.exports = {
  dirOutput
}
