import http from 'http'
import path from 'path'
import fs from 'fs'
import session from 'express-session'
import ConnectRedis from 'connect-redis'
import bodyParser from 'body-parser'
import formidable from 'express-formidable'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import express from 'express'
import socketIo from 'socket.io'
import passport from 'passport'
import bunyan from 'bunyan'
import WebSocket from '../websocket/index'
import PostgresClient from '../libs/PostgresClient'
import RedisHelper from '../libs/RedisHelper'
import RippleAddrListener from '../libs/RippleAddrListener'
import Routes from '../libs/Routes'
import config from '../config'

const log         = bunyan.createLogger(config.logger.options)
const app         = express()
const httpServer  = http.Server(app)
const io          = socketIo(httpServer, { pingInterval: 4000, pingTimeout: 12000 })
const postgres    = new PostgresClient()
const redis       = new RedisHelper()

app.disable('x-powered-by')

export default function WebServer(/*portToListenOn=config.server.port, shouldListenOnPort=true*/) {
  return [
    httpServer,
    async function startServer() {
      try {
        const routeInst = Routes({ postgres, redis, log })
        const routes = await routeInst.get()
        const isActuallyProductionHost = config.server.isProduction && config.server.host.indexOf('https') === 0

        //view engine setup
        app.set('views', path.join(config.app.rootDir, 'views'))
        app.set('view engine', 'pug')

        // redirect to https if production and connection is not secure
        app.use((req, res, next) => {
          if (isActuallyProductionHost && !req.secure)
            return res.redirect(`${config.server.host}${req.originalUrl}`)
          next()
        })

        app.use(compression())
        app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }))
        app.use(bodyParser.json({ limit: '100mb' }))

        app.use(formidable.parse())
        app.use(cookieParser(config.session.sessionSecret))

        const RedisStore = ConnectRedis(session)

        let sessionMiddleware
        if (config.session.sessionSecret && config.session.sessionCookieKey) {
          let sessionConfig = {
            store:              new RedisStore({ client: redis.client }),
            secret:             config.session.sessionSecret,
            key:                config.session.sessionCookieKey,
            resave:             true,
            saveUninitialized:  false,
            cookie:             { maxAge: 24 * 60 * 60 * 1000 } // 1 day
          }

          if (isActuallyProductionHost) {
            app.set('trust proxy', 1)
            sessionConfig.cookie.secure = true
          }

          sessionMiddleware = session(sessionConfig)
          app.use(sessionMiddleware)
        }

        app.use(passport.initialize())
        app.use(passport.session())
        io.use((socket, next) => (sessionMiddleware) ? sessionMiddleware(socket.request, socket.request.res, next) : next())

        app.use(function passIoToReq(req, res, next) {
          req.xrppayIo = io
          next()
        })

        // Custom API authentication handler
        app.use(routeInst.apiKeyMiddleware())

        app.use(function checkRedirectUrlAndFollow(req, res, next) {
          if (!(req.session.user && req.session.redirectUrl))
            return next()

          const redirectTo = req.session.redirectUrl
          delete(req.session.redirectUrl)

          req.session.save(err => {
            if (err)
              return next(err)
            res.redirect(redirectTo)
          })
        })

        //static files
        app.use('/public', express.static(path.join(config.app.rootDir, '/public')))

        //setup route handlers in the express app
        routes.forEach(route => {
          try {
            app[route.verb.toLowerCase()](route.path, route.handler)
            log.debug(`Successfully bound route to express; method: ${route.verb}; path: ${route.path}`)
          } catch(err) {
            log.error(err, `Error binding route to express; method: ${route.verb}; path: ${route.path}`)
          }
        })

        //passport setup
        const strategies = fs.readdirSync(path.join(__dirname, '..', 'passport_strategies')) || []
        strategies.forEach(stratFile => {
          try {
            const oStrat = require(path.join(__dirname, '..', 'passport_strategies', stratFile)).default({ log, postgres, redis })

            // If bindCondition exists, make sure it's truthy before
            // proceeding in case there isn't something required to
            // bind the strategy
            if (typeof oStrat.bindCondition !== 'function' || oStrat.bindCondition()) {
              const stratName = path.basename(stratFile, ".js")

              if (oStrat.options)
                return passport.use(stratName, new oStrat.strategy(oStrat.options, oStrat.handler))
              return passport.use(stratName, new oStrat.strategy(oStrat.handler))
            }

          } catch(err) {
            log.error(`Error binding passport strategy: ${stratFile}`, err)
          }
        })

        passport.serializeUser((user, done) => done(null, user))
        passport.deserializeUser((user, done) => done(null, user))

        WebSocket({ io, log, postgres, redis })
        await RippleAddrListener({ io, log, postgres, redis }).listen()

        // Express error handling
        app.use(function ExpressErrorHandler(err, req, res, next) {
          log.error('Express error handling', err)
          res.redirect(err.redirectRoute || '/')
        })

        // Assume we'll listen in the primary app file via `sticky-cluster` module
        // if (shouldListenOnPort)
        //   httpServer.listen(portToListenOn, () => log.info(`listening on *: ${portToListenOn}`))

      } catch(err) {
        log.error("Error starting server", err)
        process.exit()
      } finally {

        //handle if the process suddenly stops
        process.on('SIGINT', () => { console.log('got SIGINT....'); process.exit() })
        process.on('SIGTERM', () => { console.log('got SIGTERM....'); process.exit() })

        return app
      }
    }
  ]
}
