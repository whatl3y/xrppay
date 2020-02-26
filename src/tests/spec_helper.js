require('dotenv').config()

import path from 'path'
import child_process from 'child_process'
import config from '../config'

const fork        = child_process.fork
const postgresUrl = process.env.DATABASE_TEST_URL || 'postgres://localhost:5432/xrppay_test'

before(`Global before to run DB migrations before all tests`, async function() {
  if (config.server.isProduction)
    throw new Error(`Cannot run tests in production environment.`)

  this.timeout(30000)
  await new Promise((resolve, reject) => {
    const postgresMigrationProcess = fork(path.join('.', 'dist', 'tasks', 'database', 'migrate'), [ '-c', postgresUrl ])
    postgresMigrationProcess.on('exit', resolve)
    postgresMigrationProcess.on('error', reject)
  })
})
