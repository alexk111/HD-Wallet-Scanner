const fs = require('fs')
const path = require('path')

const bitcoinClient = require('./bitcoin-client')
const dirOutput = require('./dirs').dirOutput

async function generateReport (usedAddresses) {
  console.log('Generating report')

  const blockCount = await bitcoinClient.getBlockCount()

  // group used addresses by wallets
  const usedAddressesByWallets = {}
  for (let addr in usedAddresses) {
    if (usedAddresses.hasOwnProperty(addr)) {
      const usedAddress = usedAddresses[addr]
      const wallet = usedAddress.wallet
      if (!usedAddressesByWallets[wallet.id]) {
        usedAddressesByWallets[wallet.id] = {
          wallet,
          addresses: []
        }
      }
      usedAddressesByWallets[wallet.id].addresses.push(usedAddress)
    }
  }

  for (let walletId in usedAddressesByWallets) {
    if (usedAddressesByWallets.hasOwnProperty(walletId)) {
      const usedAddressesByWallet = usedAddressesByWallets[walletId]
      const wallet = usedAddressesByWallet.wallet
      const addresses = usedAddressesByWallet.addresses
      const scanned = {
        id: wallet.id,
        addrIdxFrom: wallet.addrIdxFrom,
        addrIdxTo: wallet.addrIdxTo,
        blockHeightFrom: wallet.blockHeightFrom,
        blockHeightTo: blockCount
      }

      const listIndexes = []
      const listInputs = []

      addresses.forEach(usedAddress => {
        listIndexes.push(usedAddress.addrIdx)
        usedAddress.txs.forEach(tx => {
          listInputs.push({
            addr: usedAddress.addr,
            addrIdx: usedAddress.addrIdx,
            blockHeight: tx.blockHeight,
            value: tx.value
          })
        })
      })

      listIndexes.sort((a, b) => a - b)

      const fName = `ids${wallet.addrIdxFrom}-${wallet.addrIdxTo} hgt${wallet.blockHeightFrom}-${blockCount}`

      fs.writeFileSync(path.join(dirOutput, `IDS ${fName}.json`), JSON.stringify({
        scanned,
        result: listIndexes
      }), {
        encoding: 'utf8'
      })

      fs.writeFileSync(path.join(dirOutput, `INS ${fName}.json`), JSON.stringify({
        scanned,
        result: listInputs
      }), {
        encoding: 'utf8'
      })
    }
  }
}

module.exports = generateReport
