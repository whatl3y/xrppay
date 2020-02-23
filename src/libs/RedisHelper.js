import Redis from 'ioredis'
import config from '../config'

const NOOP = () => {}

export default class RedisHelper {
  constructor(urlOrClient) {
    try {
      if (typeof urlOrClient === 'string') {
        this.client = new Redis(urlOrClient)
      } else {
        this.client = urlOrClient || new Redis(config.redis.url)
      }
    } catch(e) {
      this.client = null
    }
  }

  async get(key) {
    return await this.client.get(key)
  }

  // https://redis.io/commands/set
  async set(key, value, ...args) {
    return await this.client.set(key, value, ...args)
  }

  async del(key) {
    return await this.client.del(key)
  }

  async ttl(key) {
    return await this.client.ttl(key)
  }

  //http://redis.io/commands/INFO
  //memory information about redis instance
  async info(param) {
    const response = await this.client.info(param)
    return response.split('\r\n')
      .filter(str => str.includes(':'))
      .reduce((obj, str) => {
        const [ key, val ] = str.split(':')
        return { ...obj, [key.trim()]: val.trim() }
      }, {})
  }

  async numberOfKeys() {
    return this.client.dbsize()
  }

  scan(cursor, options=null) {
    return new Promise((resolve, reject) => {
      const callback = (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }

      if (options instanceof Array) {
        return this.client.scan(cursor, ...options, callback)
      }
      this.client.scan(cursor, callback)
    })
  }

  async scanMatch(match, iterationCallback=NOOP, cursor=0, numMatches=0) {
    const [ newCursor, matches ] = await this.scan(cursor, [ 'match', match ])
    if (matches && matches.length > 0) {
      numMatches += matches.length
      await Promise.all(matches.map(async match => await iterationCallback(match)))
    }

    if (newCursor == '0')
      return numMatches

    return await this.scanMatch(match, newCursor, iterationCallback, numMatches)
  }

  end() {
    this.client.quit()
  }

  close() {
    this.end()
  }

  quit() {
    this.end()
  }
}
