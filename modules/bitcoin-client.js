const BitcoinClient = require('bitcoin-core')

const BITCOIND_RPCHOST = process.env.BITCOIND_RPCHOST || ''
const BITCOIND_RPCPORT = process.env.BITCOIND_RPCPORT || ''
const BITCOIND_RPCUSER = process.env.BITCOIND_RPCUSER || ''
const BITCOIND_RPCPASSWORD = process.env.BITCOIND_RPCPASSWORD || ''

const bitcoinClient = new BitcoinClient({
  username: BITCOIND_RPCUSER,
  password: BITCOIND_RPCPASSWORD,
  host: BITCOIND_RPCHOST,
  port: BITCOIND_RPCPORT
})

let blockCount

async function getBlockCount() {
  // freeze it until the scan ends
  if (!blockCount) {
    blockCount = await bitcoinClient.getBlockCount()
  }
  return blockCount
}

async function getBlockByHeight(blockHeight) {
  const blockHash = await bitcoinClient.getBlockHash(blockHeight)
  const block = await bitcoinClient.getBlock(blockHash, 0)
  return block
}

module.exports = {
  getBlockCount,
  getBlockByHeight
}
