// import minimist from 'minimist'
import RippleClient from '../../libs/RippleClient'
import config from '../../config'

// const argv = minimist(process.argv.slice(2))
// const version = argv.v

;(async function getLedgerVersion() {
  try {
    const res = await RippleClient().getLedgerVersion()
    console.log(`Ledger version:`, res)

  } catch(err) {
    console.error(`Error getting ledger version`, err)
  } finally {
    process.exit()
  }
})()
