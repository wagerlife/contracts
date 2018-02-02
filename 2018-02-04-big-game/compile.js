const path = require('path');
const fs = require('fs');
const solc = require('solc');

const bigGamePath = path.resolve(__dirname, 'BigGame.sol');

const source = fs.readFileSync(bigGamePath, 'utf8');

module.exports = solc.compile(source, 1).contracts[':BigGame'];
