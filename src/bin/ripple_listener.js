// import newrelic from 'newrelic'
import bunyan from 'bunyan'
import RippleClient from '../libs/RippleClient'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)

;(async function rippleListener() {
  const subscribeResponse = await RippleClient().subscribeToAddress(config.ripple.masterClassicAddr, async function processTxn(evt) {
    console.log("TXN", JSON.stringify(evt, null, 2))
  })

  log.debug("Subscribe response:", JSON.stringify(subscribeResponse, null, 2))

  process.on('SIGINT', killProcess)
  process.on('SIGTERM', killProcess)

  async function killProcess() {
    log.info('Shutting down...')
    process.exit()
  }
})()
