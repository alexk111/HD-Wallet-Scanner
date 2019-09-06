const scanner = require('./modules/scanner')
const generateReport = require('./modules/generate-report')

async function main () {
  const usedAddresses = await scanner.scan()
  await generateReport(usedAddresses)
}

main()
