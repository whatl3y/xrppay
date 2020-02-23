import path from 'path'
import Mailer, { MailerHelpers } from '../libs/Mailer'
// import Users from '../libs/models/Users'
import config from '../config'

export default function AuthWorkers({ redis, postgres }) {
  // const users = Users(postgres)

  return {
    sendVerificationMailer: {
      plugins: [ 'Retry' ],
      pluginOptions: {
        retry: {
          retryLimit: 5,
          retryDelay: 1000 * 5,
        }
      },
      perform: async options => {
        const mailer  = Mailer()
        const title   = options.title || 'Verify Your Account'
        const link    = options.verificationCode ? `${config.server.host}/auth/verify/${options.verificationCode}` : null

        await mailer.send({
          to: options.userEmail || options.user_email,
          subject: `${config.app.titleCaseName}: ${title}`,
          html: await MailerHelpers.getTemplateHtml(path.join(config.app.rootDir, 'mailers', 'auth', 'user_verification.pug'), MailerHelpers.baseOptions({
            title,
            verification_link: link,
            ...options
          }))
        })
      }
    }
  }
}
