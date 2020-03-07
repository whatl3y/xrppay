import LoginHandler from '../libs/LoginHandler'
import Errors from '../errors'
import Users from '../libs/models/Users'

export default function({ log, postgres }) {
  return {
    priority: 0,
    verb: 'GET',
    route: '/auth/verify/:code',
    handler: async (req, res, next) => {
      const loginHandler = LoginHandler(postgres, req, { log })
      const users = Users(postgres, req.session)
      const verificationCode = req.params.code

      const userRecord = await users.findBy({ verification_code: verificationCode })
      if (!userRecord)
        return next(new Errors.InvalidVerificationCode('Invalid verification code.'))

      if (userRecord.is_verified)
        return next(new Errors.InvalidVerificationCode('Verification code already used.'))

      await users.logout()
      users.setRecord({
        ...userRecord,
        is_verified: true,
        last_login: new Date()
      }, true)
      await users.save()
      await loginHandler.standardLogin(users.record)
      res.redirect('/')
    }
  }
}