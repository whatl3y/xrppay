import PassportLocal from 'passport-local'
import Users from '../libs/models/Users'
import Errors from '../errors'
// import BackgroundWorker from '../libs/BackgroundWorker'
import LoginHandler from '../libs/LoginHandler'
// import config from '../config'

const LocalStrategy = PassportLocal.Strategy

export default function LocalPassportStrategy({ log, postgres, redis }) {
  return {
    strategy: LocalStrategy,
    options: {
      passReqToCallback: true
    },
    handler: async function PassportLocalHandler(
      req,
      username,
      password,
      done,
      createNewUser=false,
      lastLogin=new Date()
    ) {
      try {
        const users = Users(postgres, req.session)
        const login = LoginHandler(postgres, req, { log })

        username = username.toLowerCase()
        let userRecord = await users.findBy({ username_email: username })
        if (userRecord) {
          // If the user has tried to login 3 times unsuccessfully, presumably
          // due to an incorrect password each time, require them to wait
          // up to 5 minutes to retry. This will prevent bots from trying
          // to login as another user with a script.
          const badPasswordKey  = `incorrect_password_${username}`
          const currentBadCount = await redis.get(badPasswordKey)
          if (currentBadCount && currentBadCount > 3)
            throw new Errors.IncorrectPasswordTooManyTries(`You've tried your password incorrectly too many times.`)

          if (!userRecord.password_hash)
            throw new Errors.NoPassword(`No password yet.`)

          if (!password)
            throw new Errors.IncorrectPassword(`Bad password.`)

          if (!(await users.validateUserPassword(username, password, userRecord.password_hash))) {
            const pipeline = redis.client.pipeline().incr(badPasswordKey).expire(badPasswordKey, 60 * 5)
            await pipeline.exec()

            throw new Errors.IncorrectPassword(`Bad password.`)
          }

        } else {
          // ----------------------------------------------------------------
          // TODO: 2019-02-06: Right now we don't want someone without
          // a user record to sign up without being invited.
          if (!createNewUser)
            throw new Errors.NoEmailAddress('No email address found for this user.')
          // ----------------------------------------------------------------

          // Confirm username is valid e-mail address
          // if(!Utilities.Regexp.email.test(username))
          //   throw new Errors.InvalidEmailAddress(`Invalid email format.`)

          if (!users.passwordHasMinimumRequirements(password))
            throw new Errors.PasswordNotValid(`Does not meet minimum requirements.`)

          userRecord = await users.findOrCreateBy({ username_email: username })
          users.setRecord({
            password_hash: await users.hashPassword(password),
            is_verified: false,
            verification_code: users.generateVerificationCode()
          }, true)

          // Only send the verification mailer if createNewUser is not set since
          // we will include the verification link together with temp password
          // e-mail that is sent in the `invite` endpoint
          if (!createNewUser) {
            await BackgroundWorker({ redis }).enqueue('sendVerificationMailer', {
              title: 'Welcome to xrppay!',
              userEmail: username,
              verificationCode: users.record.verification_code
            }, config.resque.mailer_queue)
          }
        }

        users.setRecord({
          id: userRecord.id,
          last_login: lastLogin,
          last_session_refresh: lastLogin,
          num_logins: (userRecord.num_logins || 0) + 1
        }, true)
        const userId = await users.save()

        await login.standardLogin({ ...userRecord, ...users.record })
        return done(null, username)

      } catch(err) {
        done(err)
        throw err
      }
    }
  }
}
