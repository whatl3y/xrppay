import path from 'path'
import bunyan from 'bunyan'
import requireAll from 'require-all'
import Promise from 'bluebird'
import PostgresClient from '../libs/PostgresClient'
import { flatten } from '../libs/Helpers'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)

export default async function runMigrations(postgresUrl) {
  try {
    const postgres = new PostgresClient(postgresUrl, { max: 1 })
    await Promise.each(migrations(), async migrationFunction => {
      log.debug(`Running migration function`, migrationFunction)
      await migrationFunction(postgres)
    })

    log.info("Successfully ran DB migrations!")
    process.exit()

  } catch(err) {
    log.error("Error running DB migrations", err)
    process.exit()
  }
}

export function migrations() {
  const allMigrations = requireAll(path.join(__dirname, 'migrations'))
  return flatten(Object.keys(allMigrations)
    .sort((file1, file2) => parseFloat(file1) - parseFloat(file2))
    .map(key => allMigrations[key].default))
}
