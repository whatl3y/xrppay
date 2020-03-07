import BackgroundWorker from '../../../../libs/BackgroundWorker'
import SessionHandler from '../../../../libs/SessionHandler'
import Users from '../../../../libs/models/Users'
import LocalStrategy from '../../../../passport_strategies/local'
import config from '../../../../config'

export default function({ log, postgres, redis }) {
  return {
    session(req, res) {
      res.json({ session: req.session })
    },

    async ['create/user'](req, res) {
      try {
        const username = req.body.username
        const password = req.body.password
        const confPass = req.body.cpassword
        
        if (!password || password !== confPass)
          return res.redirect('/login?password_confirm')

        await LocalStrategy({ log, postgres, redis }).handler(
          req,
          username,
          password,
          () => {},
          true)

        res.redirect('/')

      } catch(err) {
        log.error(`Error creating new user`, err)
        res.redirect(err.redirectRoute || '/')
      }
    },

    async ['password/forgot'](req, res) {
      const users = Users(postgres)
    
      const username = req.body.email
      const userRecord = await users.findBy({ username_email: username })
      if (!userRecord)
        return res.status(404).json({ error: `We didn't find a user record with the email address provided.` })
    
      const tempPassword = users.generateTempPassword()
      const tempPwHash = await users.hashPassword(tempPassword)
      users.setRecord({
        id: userRecord.id,
        needs_password_reset: true,
        password_hash: tempPwHash
      }, true)
    
      await Promise.all([
        users.save(),
        BackgroundWorker({ redis }).enqueue('sendVerificationMailer', {
          user_email: userRecord.username_email,
          temp_pw:    tempPassword
        }, config.resque.mailer_queue)
      ])
    
      res.json({ success: `An e-mail has been sent to restore your password.` })
    },

    async ['password/reset'](req, res) {
      const session           = SessionHandler(req.session, { redis })
      const users             = Users(postgres, req.session)
      const userRec           = session.getLoggedInUserId(true)
      const currentPassword   = req.body.current_password
      const newPassword       = req.body.new_password

      if (userRec.password_hash) {
        if (!currentPassword)
          return res.status(401).json({ error: `Please enter your current password to validate before changing.` })

        if (currentPassword === newPassword)
          return res.status(400).json({ error: `Please enter a different password than your previous one.` })

        const isCurrentPasswordCorrect = await users.validateUserPassword(userRec.username_email, currentPassword)
        if (!isCurrentPasswordCorrect)
          return res.status(401).json({ error: `The current password you provided is not correct. Please try again.` })
      }

      if (!users.passwordHasMinimumRequirements(newPassword))
        return res.status(400).json({ error: `Your new password does not meet the minimum requirements. (8 chars minimum, 3 of 4 character classes [lower case, upper case, numbers, special characters])` })

      const newHashedPassword = await users.hashPassword(newPassword)
      users.setRecord({
        id: userRec.id,
        password_hash: newHashedPassword,
        needs_password_reset: null,
        last_password_reset: new Date()
      }, true)
      await users.save()

      res.json(true)
    },

    async ['resend/verification'](req, res) {
      const session = SessionHandler(req.session, { redis })
      const userRec = session.getLoggedInUserId(true)
  
      await BackgroundWorker({ redis }).enqueue('sendVerificationMailer', {
        userEmail: userRec.username_email,
        verificationCode: userRec.verification_code
      }, config.resque.mailer_queue)
  
      res.json(true)
    }
  }
}