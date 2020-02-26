import path from 'path'
import createCWStream from 'bunyan-cloudwatch'

const appName = process.env.APP_NAME || "xrppay_dev"
const hostName = process.env.HOSTNAME || "http://localhost:8080"

export default {
  apiKeyHeader: 'x-xrppay-key',

  app: {
    name: appName,
    titleCaseName: appName,
    rootDir: (function() {
      try {
        return path.join(path.dirname(require.main.filename), '..', '..')
      } catch(e) {
        return __dirname
      }
    })(),

    tmpDir: process.env.TMP_DIR || 'tmp'
  },

  cryptography: {
    algorithm: "aes256",
    password: process.env.CRYPT_SECRET
  },

  server: {
    isProduction: process.env.NODE_ENV === 'production',
    port:         process.env.PORT || 8080,
    concurrency:  parseInt(process.env.WEB_CONCURRENCY || 1),
    host:         hostName,
    apiHost:      process.env.API_HOSTNAME || "http://localhost:8080"
  },

  postgres: {
    connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/xrppay',
    seedEmail: process.env.SEED_EMAIL_ADDRESS || 'whatl3y@gmail.com'
  },

  privacy: {
    apiKey: process.env.PRIVACY_API_KEY,
    serverUrl: process.env.NODE_ENV === 'production' ? 'https://sandbox.privacy.com/v1/' : 'https://api.privacy.com/v1/'
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },

  ripple: {
    masterAddr: process.env.RIPPLE_X_ADDRESS,
    masterClassicAddr: process.env.RIPPLE_CLASSIC_ADDR,
    masterAddrSecret: process.env.RIPPLE_SECRET,
    rippledUrl: process.env.NODE_ENV === 'production' ? (process.env.RIPPLED_SERVER_URL || 'wss://s1.ripple.com') : 'wss://s.altnet.rippletest.net:51233'
  },

  session: {
    sessionSecret: process.env.SESSION_SECRET,
    sessionCookieKey: process.env.SESSION_COOKIE_KEY
  },

  mailer: {
    sendgrid: {
      key: process.env.SENDGRID_API_KEY
    },

    transporterConfig: {
      // host: 'smtp.office365.com',
      // port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // tls: {
      //   ciphers: 'SSLv3'
      // }
    }
  },

  newrelic: {
    key:    process.env.NEWRELIC_KEY,
    level:  process.env.NEWRELIC_LEVEL || 'info'
  },

  resque: {
    critical_queue: process.env.RESQUE_CRITICAL_QUEUE || 'xrppay_resque_critical',
    mailer_queue: process.env.RESQUE_MAILER_QUEUE || 'xrppay_resque_mailer',
    default_queue: process.env.RESQUE_QUEUE || 'xrppay_resque_default',
    workflow_queue: process.env.RESQUE_WORKFLOW_QUEUE || 'xrppay_resque_workflow',
    vulnerability_queue: process.env.RESQUE_VULNERABILITY_QUEUE || 'xrppay_resque_vulnerability',

    getAllQueues() {
      return [
        this.critical_queue,
        this.mailer_queue,
        this.default_queue,
        this.workflow_queue,
        this.vulnerability_queue
      ]
    }
  },

  aws: {
    access_key:     process.env.AWS_ACCESS_KEY_ID,
    access_secret:  process.env.AWS_SECRET_ACCESS_KEY,

    s3: {
      bucket: process.env.AWS_S3_BUCKET || 'xrppay.com'
    }
  },

  logger: {
    options: {
      name:   appName,
      level:  process.env.LOGGING_LEVEL || "info",
      streams: [
        {
          stream: process.stdout
        }, {
          stream: createCWStream({
            logGroupName: process.env.AWS_CLOUDWATCH_LOGS_GROUP || 'xrppay_dev',
            logStreamName: process.env.AWS_CLOUDWATCH_LOGS_STREAM || 'anonymous',
            cloudWatchLogsOptions: {
              region: process.env.AWS_CLOUDWATCH_LOGS_REGION || 'us-east-1'
            }
          }),
          type: 'raw'
        }
      ]
    }
  },

  errors: {
    '401': `You do not have access to perform this action. If you think this is a mistake contact your administrator.`,
    '403': `You do not have permission for this resource. Consider upgrading your plan to gain access to this resource or operation.`
  }
}
