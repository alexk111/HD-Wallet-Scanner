const bitcoin = require('bitcoinjs-lib')

const initWallets = require('./init-wallets')
const bitcoinClient = require('./bitcoin-client')
const getAddressFromTxOutput = require('./get-address-from-tx-output')

const MAX_ADDRESSES_PER_ITERATION = process.env.MAX_ADDRESSES_PER_ITERATION || 100000

const allAddresses = new Map()
let usedAdresses

async function getBlockTxs (blockHeight) {
  const block = await bitcoinClient.getBlockByHeight(blockHeight)
  const parsedBlock = bitcoin.Block.fromHex(block)
  return parsedBlock.transactions
}

async function scanAllAddresses (blockHeightFrom, blockHeightTo) {
  console.log('Start scanning addresses')
  for (let blockHeight = blockHeightFrom; blockHeight <= blockHeightTo; blockHeight++) {
    console.log(`Processing Block. Height ${blockHeight}/${blockHeightTo}. Progress ${(blockHeight - blockHeightFrom) / (blockHeightTo - blockHeightFrom)}`)
    const txs = await getBlockTxs(blockHeight)
    txs.forEach(tx => {
      tx.outs.forEach(output => {
        const outAddr = getAddressFromTxOutput(output)
        const addrData = allAddresses.get(outAddr)
        if (addrData) {
          if (!usedAdresses[outAddr]) {
            usedAdresses[outAddr] = {
              addr: outAddr,
              addrIdx: addrData.addrIdx,
              wallet: addrData.wallet,
              txs: []
            }
          }
          usedAdresses[outAddr].txs.push({
            blockHeight,
            value: output.value
          })
        }
      })
    })
  }

  // clear
  allAddresses.clear()
}

async function scan () {
  allAddresses.clear()
  usedAdresses = {}

  let scanFromBlockHeight = 999999999
  const scanToBlockHeight = await bitcoinClient.getBlockCount()
  const wallets = initWallets()

  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i]

    if (wallet.blockHeightFrom < scanFromBlockHeight) {
      scanFromBlockHeight = wallet.blockHeightFrom
    }

    for (let addrIdx = wallet.addrIdxFrom; addrIdx <= wallet.addrIdxTo; addrIdx++) {
      if (allAddresses.size % 20000 === 0) {
        console.log('Generating addresses: ' + allAddresses.size)
      }
      const addr = wallet.generateAddress(addrIdx)
      allAddresses.set(addr, { addrIdx, wallet })
      if (allAddresses.size >= MAX_ADDRESSES_PER_ITERATION) {
        await scanAllAddresses(scanFromBlockHeight, scanToBlockHeight)
      }
    }
  }

  if (allAddresses.size > 0) {
    await scanAllAddresses(scanFromBlockHeight, scanToBlockHeight)
  }

  return usedAdresses
}

module.exports = {
  scan
}
