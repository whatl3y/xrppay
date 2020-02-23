require('dotenv').config()

import minimist from 'minimist'
import runMigrations from '../../database'
import config from '../../config'

const argv = minimist(process.argv.slice(2))
const postgresUrl = argv.c || argv.connection_string || config.postgres.connectionString

;(async function(connString) {
  await runMigrations(connString)
  process.exit()
})(postgresUrl)
