import { MultiWorker, Scheduler } from 'node-resque'
import config from '../config'

export default function startResqueServer({ connection, jobs, log, queues }) {
  return async function start() {
    const multiWorker = new MultiWorker({
      connection:          connection,
      queues:              queues,
      minTaskProcessors:   1,
      maxTaskProcessors:   config.server.concurrency,
      checkTimeout:        1000,
      maxEventLoopDelay:   10,
      toDisconnectProcessors: true,
    }, jobs)

    const scheduler = new Scheduler({ connection: connection })

    await scheduler.connect()
    scheduler.start()
    multiWorker.start()

    multiWorker.on('start',           workerId => log.debug(`worker[${workerId}] started`))
    multiWorker.on('end',             workerId => log.debug(`worker[${workerId}] ended`))
    multiWorker.on('cleaning_worker', (workerId, worker, pid) => log.debug(`cleaning old worker ${worker} (${workerId} -- ${pid})`))
    multiWorker.on('poll',            (workerId, queue) => log.debug("worker["+workerId+"] polling " + queue))
    multiWorker.on('ping',            (workerId, time) => log.debug("worker[" + workerId + "] check in @ " + time))
    multiWorker.on('job',             (workerId, queue, job) => log.info("worker["+workerId+"] working job " + queue + " " + printObject(job)))
    multiWorker.on('reEnqueue',       (workerId, queue, job, plugin) => log.info("worker["+workerId+"] reEnqueue job (" + printObject(plugin) + ") " + queue + " " + printObject(job)))
    multiWorker.on('success',         (workerId, queue, job, result) => log.info("worker["+workerId+"] job success " + queue + " " + printObject(job) + " >> " + printObject(result)))
    multiWorker.on('failure',         (workerId, queue, job, failure) => log.error("worker["+workerId+"] job failure " + queue + " " + printObject(job) + " >> " + printObject(failure)))
    multiWorker.on('error',           (workerId, queue, job, error) => log.error("worker["+workerId+"] error " + queue + " " + printObject(job) + " >> " + printObject(error)))
    multiWorker.on('pause',           workerId => log.debug("worker["+workerId+"] paused"))
    multiWorker.on('internalError',   error => log.error(printObject(error)))
    multiWorker.on('multiWorkerAction', (verb, delay) => log.debug(`*** checked for worker status: ${verb} (event loop delay: ${delay} ms)`))

    scheduler.on('start',             () => log.debug("scheduler started"))
    scheduler.on('end',               () => log.info("scheduler ended"))
    scheduler.on('poll',              () => log.debug("scheduler polling"))
    scheduler.on('master',            () => log.info("scheduler became master"))
    scheduler.on('error',             error => log.error(`scheduler error >> ${printObject(error)}`))
    scheduler.on('cleanStuckWorker',  (workerName, errorPayload, delta) => log.info(`failing ${workerName} (stuck for ${delta}s) and failing job ${errorPayload}`))
    scheduler.on('workingTimestamp',  timestamp => log.info(`scheduler working timestamp ${timestamp}`))
    scheduler.on('transferredJob',    (timestamp, job) => log.info(`scheduler enquing job ${timestamp} >> ${printObject(job)}`))

    return {
      multiWorker,
      scheduler
    }
  }
}

export function printObject(obj) {
  if (!obj)
    return 'N/A'

  if (obj instanceof Error)
    return obj.stack

  if ({}.toString.call(obj) == "[object Object]")
    return JSON.stringify(obj)

  return obj.toString()
}
