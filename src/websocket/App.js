import { sleep } from '../libs/Helpers'
import namespaces from './cache'

export default function App(redis) {
  return {
    namespaces: {
      ...namespaces
    },

    baseKey: 'XrppayWebSocketApp',

    async set(namespace, ...args) {
      // await this.lock()
      let [ key, value ] = args
      switch (args.length) {
        case 1:
          key = 'default'
          value = args[0]
          break
      }

      this.namespaces[namespace] = this.namespaces[namespace] || {}
      this.namespaces[namespace][key] = value
      // let currentNamespaceData = JSON.parse((await redis.get(`${this.baseKey}.${namespace}`)) || '{}')
      // currentNamespaceData[key] = value
      // await redis.set(`${this.baseKey}.${namespace}`, JSON.stringify(currentNamespaceData))
      //
      // await this.lock(true)
      return value
    },

    async get(namespace, key=null) {  // key == null means get all namespace data
      const currentNamespaceData = this.namespaces[namespace]
      return (key) ? currentNamespaceData[key] : currentNamespaceData
      // const currentNamespaceData = JSON.parse((await redis.get(`${this.baseKey}.${namespace}`)) || '{}')
      // return (key) ? currentNamespaceData[key] : currentNamespaceData
    },

    async del(namespace, key='default') {
      this.namespaces[namespace] = this.namespaces[namespace] || {}
      delete(this.namespaces[namespace][key])
      // await this.lock()
      // let currentNamespaceData = JSON.parse((await redis.get(`${this.baseKey}.${namespace}`)) || '{}')
      // delete(currentNamespaceData[key])
      // await redis.set(`${this.baseKey}.${namespace}`, JSON.stringify(currentNamespaceData))
      // await this.lock(true)
    },

    async flush(namespaces=Object.keys(this.namespaces)) {
      // return await Promise.all(
      //   namespaces.map(async namespace => {
      //     await redis.del(`${this.baseKey}.${namespace}`)
      //   })
      // )
    },

    async globalLock(releaseLock=false) {
      return await this.genericLock(`${this.baseKey}.globalLock`, releaseLock)
    },

    async lock(releaseLock=false) {
      return await this.genericLock(`${this.baseKey}.lock`, releaseLock)
    },

    async genericLock(lockKey, releaseLock=false) {
      if (releaseLock)
        return await redis.del(lockKey)

      // Max locking time if something goes wrong is 10 seconds
      const wasAbleToLock = await redis.set(lockKey, 'true', 'nx', 'ex', 10)
      if (wasAbleToLock)
        return true

      await sleep(this.randMs())
      return await this.genericLock(lockKey, releaseLock)
    },

    randMs() {
      return Math.floor((Math.random() * 20) + 10)
    }
  }
}
