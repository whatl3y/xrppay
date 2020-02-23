import path from 'path'
import { flatten } from '../libs/Helpers'
import Mailer, { MailerHelpers } from '../libs/Mailer'
import Users from '../libs/models/Users'
import config from '../config'

export default function AuthWorkers({ redis, postgres }) {
  const users = Users(postgres)

  return {
    // checkAndSendCommunication: {
    //   plugins: [ 'Retry' ],
    //   pluginOptions: {
    //     retry: {
    //       retryLimit: 5,
    //       retryDelay: 1000 * 5,
    //     }
    //   },
    //   perform: async options => {
    //     const teamId      = options.team_id
    //     const commType    = options.type
    //     const params      = options.params
    //     const exceptions  = options.exceptions
    //     const commInfo    = flatten(Object.values(Communication)).find(t => t.internal === commType)
    //     const mailer      = Mailer()
    //     const prefs       = UserCommunicationPreferences(postgres)

    //     // If there are exception user IDs provided, we don't want to
    //     // send e-mails to theses users.
    //     let [ userIds, team ] = await Promise.all([
    //       prefs.getAllUserIdsToReceiveNotification(teamId, commType),
    //       teams.find(teamId)
    //     ])

    //     if (exceptions instanceof Array)
    //       exceptions.forEach(userId => userIds.splice(userIds.indexOf(userId), 1))

    //     await Promise.all(
    //       userIds.map(async function sendUserCommunication(userId) {
    //         const userRecord = await users.find(userId)

    //         // If this communication type contains parameters that
    //         // have a user_id, don't send this mail to that user.
    //         if (params && params.user_id && parseInt(params.user_id) === userId)
    //           return

    //         await mailer.send({
    //           to: userRecord.username_email,
    //           subject: `${config.app.titleCaseName}: ${commInfo.external}`,
    //           html: await MailerHelpers.getTemplateHtml(path.join(config.app.rootDir, 'mailers', 'auth', 'standard_communication.pug'), MailerHelpers.baseOptions({
    //             title: commInfo.external,
    //             host: config.server.host,
    //             text: (typeof commInfo.getEmailText === 'function') ? commInfo.getEmailText({ ...options, team }) : ''
    //           }))
    //         })
    //       })
    //     )
    //   }
    // },
  }
}
