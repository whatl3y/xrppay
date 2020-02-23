import { Queue } from 'node-resque'
import config from '../config'

// `redis` is instance of RedisHelper
export default function BackgroundWorker({ redis }) {
  const backgroundWorkerQueue = new Queue({ connection: { redis: redis.client }})

  return {
    backgroundWorkerQueue,
    isConnected: false,

    async enqueue(
      job,
      options={},
      queue=config.resque.default_queue
    ) {
      await this.connect()
      await this.backgroundWorkerQueue.enqueue(queue, job, [options])
    },

    async connect() {
      if (this.isConnected)
        return
      
      await this.backgroundWorkerQueue.connect()
      this.isConnected = true
    }
  }
}
