import Errors from '../errors'
import Users from './models/Users'

export default function LoginHandler(postgres, request, options=null) {
  const session = request.session
  const users   = Users(postgres, session)

  return {
    async standardLogin(userRecord, alreadyLoggedIn=false) {
      if (userRecord.is_disabled)
        throw new Errors.AccountDisabled(`This user account is disabled.`)

      if (options && options.log)
        options.log.info(`LoginHandler.standardLogin logging in`, JSON.stringify({ ...userRecord, password_hash: null }))

      await users.login(userRecord)
      await users.setSession({ last_login: new Date() })

      // if (!alreadyLoggedIn) {
      //   await AuditLog(postgres).log({
      //     team_id: currentActiveTeam.id,
      //     user_id: userRecord.id,
      //     action: 'Login',
      //     // additional_info: {}
      //   })
      // }
    }
  }
}
