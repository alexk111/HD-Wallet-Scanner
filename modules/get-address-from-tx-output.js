const bitcoin = require('bitcoinjs-lib')

function getAddressFromTxOutput (output) {
  let payment
  let address = ''
  let isDone
  Object.keys(bitcoin.payments).forEach(type => {
    if (isDone) {
      return
    }
    try {
      payment = bitcoin.payments[type]({output: output.script})
    } catch (e) {
      return
    }
    address = payment.address
    if (!address) {
      address = '' // Legacy P2PK, OP_RETURN etc.
    }
    isDone = true
  })
  return address
}

module.exports = getAddressFromTxOutput
