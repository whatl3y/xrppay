import { Pool } from 'pg'
import QueryStream from 'pg-query-stream'
import config from '../config'

const NOOP = ()=>{}

export default class PostgresClient {
  constructor(connStrOrConfig=config.postgres.connectionString, additionalConfig={}) {
    if (typeof connStrOrConfig === 'string') {
      this.pool = new Pool({ connectionString: connStrOrConfig })
    } else {
      this.pool = new Pool({
        host:               connStrOrConfig.host,
        user:               connStrOrConfig.user,
        password:           connStrOrConfig.password,
        database:           connStrOrConfig.database,
        ssl:                connStrOrConfig.ssl,
        max:                additionalConfig.max || 2,    // max number of clients in the pool
        idleTimeoutMillis:  5000 // how long a client is allowed to remain idle before being closed
      })
    }

    this.logger = additionalConfig.logger || additionalConfig.log || {
      fatal:    console.log,
      critical: console.log,
      error:    console.log,
      info:     NOOP,
      debug:    NOOP
    }

    this.bindPoolErrorEvent()
  }

  async query(...args) {
    let query = args[0]
    let values = args[1]

    this.logger.debug(`PostgresClient#query`, query, values)

    if (values)
      return await this.pool.query(query, values)

    return await this.pool.query(query)
  }

  queryStream(query, ...args) {
    return new Promise(async (resolve, reject) => {
      let client
      try {
        client = await this.pool.connect()

        let values = []
        let individualCallback = NOOP
        switch (args.length) {
          case 2:
            values = args[0]
            individualCallback = args[1]
            break
          case 1:
            individualCallback = args[0]
            break
        }

        this.logger.debug(`PostgresClient#queryStream`, query, values)

        const queryStream = new QueryStream(query, values)
        const stream = client.query(queryStream)

        stream.on('data', individualCallback)

        stream.on('error', err => {
          stream.pause()
          client.release()
          reject(err)
        })

        stream.on('end', function() {
          client.release()
          resolve()
        })

      } catch(err) {
        client.release()
        reject(err)
      }
    })
  }

  bindPoolErrorEvent() {
    this.pool.on('error', (err, client) => {
      // if an error is encountered by a client while it sits idle in the pool
      // the pool itself will emit an error event with both the error and
      // the client which emitted the original error
      // this is a rare occurrence but can happen if there is a network partition
      // between your application and the database, the database restarts, etc.
      // and so you might want to handle it and at least log it out
      this.logger.error('idle client error', err.message, err.stack, client)
    })
  }

  close() {
    this.pool.end()
  }

  async addColumnIfNotExists(table, column, columnType, defaultValue=null) {
    await this.query(`
      DO $$
          BEGIN
              BEGIN
                  ALTER TABLE ${table} ADD COLUMN ${column} ${columnType} ${defaultValue || ''};
              EXCEPTION
                  WHEN duplicate_column THEN RAISE NOTICE 'column ${column} already exists in ${table}.';
              END;
          END;
      $$
    `)
  }

  async addConstraintWithoutException(addConstraintSql) {
    addConstraintSql = addConstraintSql.replace(/\n|\r\n/g, '').replace(';', '')

    await this.query(`
      DO $$
          BEGIN
              BEGIN
                  ${addConstraintSql};
              EXCEPTION
                  WHEN duplicate_object THEN RAISE NOTICE 'constraint already exists: ${addConstraintSql}';
                  WHEN duplicate_table THEN RAISE NOTICE 'constraint already exists: ${addConstraintSql}';
              END;
          END;
      $$
    `)
  }
}
