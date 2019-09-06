const bitcoin = require('bitcoinjs-lib')

const parseXPub = require('./parse-xpub')
const addressGenerators = require('./address-generators')

const wallets = require('../wallets')

function initWallets () {
  const sortedWallets = []
  for (let id in wallets) {
    if (wallets.hasOwnProperty(id)) {
      const wallet = wallets[id]
      wallet.id = id

      wallet.blockHeightFrom = wallet.blockHeightFrom || 0

      // parse the provided xpub: get version bytes converted to xpub and address encoiding
      let parsedXPub
      let hdKey
      try {
        parsedXPub = parseXPub(wallet.xpub)
        hdKey = bitcoin.bip32.fromBase58(parsedXPub.xpub)
      } catch (e) {
        throw new Error('Invalid xpub value in ' + id)
      }

      // setup an address generator
      const addrEnc = wallet.addrEnc || parsedXPub.addrEnc
      const addressGenerator = addressGenerators[addrEnc]
      if (!addressGenerator) {
        throw new Error(`${addrEnc} is not supported yet`)
      }
      wallet.generateAddress = ((hdKey, addressGenerator) => {
        return (idx) => {
          return addressGenerator(hdKey, idx)
        }
      })(hdKey, addressGenerator)

      sortedWallets.push(wallet)
    }
  }

  sortedWallets.sort((a, b) => b.blockHeightFrom - a.blockHeightFrom)

  return sortedWallets
}

module.exports = initWallets
