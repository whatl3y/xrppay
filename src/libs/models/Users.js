import moment from 'moment'
import uuidv1 from 'uuid/v1'
import DatabaseModel from './DatabaseModel'
import Encryption from '../Encryption'
import SessionHandler from '../SessionHandler'
import UsersDeviceLogins from './UsersDeviceLogins'

export default function Users(postgres, session=null) {
  const factoryToExtend = DatabaseModel(postgres, 'users')
  const sessionHandler  = SessionHandler(session)

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'name',
        'username_email',
        'password_hash',
        'first_name',
        'last_name',
        'job_title',
        'avatar_file',
        'is_verified',
        'verification_code',
        'needs_password_reset',
        'last_password_reset',
        'last_login',
        'last_session_refresh',
        'num_logins',
        'user_type',
        'two_factor_enabled',
        'two_factor_secret',
        'two_factor_last_entered',
        'two_factor_timeout_minutes',
        'is_disabled',
        'phone_number',
        'summary',
        'experience',
        'education',
        'alert_prefs',

        // Internal column that controls who can override PCI passing status
        // for vulnerability items of customer's external scans. This should
        // only be populated for internal users.
        'is_asv_user',
        'asv_cert_number',

        // controls if nav items for unauthorized items show as grayed out
        // or not at all
        'show_unauthorized_modules'
      ],

      // columns that should only be updated via the backend or an admin
      // and not available for a user to make changes to
      restrictedColumns: [
        'username_email',
        'is_verified',
        'verification_code',
        'password_hash',
        'needs_password_reset',
        'last_password_reset',
        'last_login',
        'last_session_refresh',
        'num_logins',
        'user_type',
        'two_factor_enabled',
        'two_factor_secret',
        'two_factor_last_entered',
        'two_factor_timeout_minutes',
        'asv_cert_number'
      ],

      populateName(record) {
        if (record.name) {
          const splitName = record.name.split(' ')
          return {
            name: record.name,
            first_name: splitName.slice(0, 1)[0],
            last_name: splitName.slice(1).join(' ')
          }
        }

        if (record.first_name && record.last_name) {
          return {
            name: `${record.first_name} ${record.last_name}`,
            first_name: record.first_name,
            last_name: record.last_name
          }
        }

        return {}
      },

      async isUsernameAvailabile(usernameEmail) {
        const { rows } = await postgres.query(`
          select username_email from users where username_email = $1
        `, [ usernameEmail ])
        return rows.length === 0
      },

      async generateAndSaveVerificationCode(userId, isVerified=false) {
        this.setRecord({ id: userId, is_verified: !!isVerified, verification_code: this.generateVerificationCode() })
        return await this.save()
      },

      async validateUserPassword(username, plainPassword, hashedPasswordToCheck=null) {
        if (hashedPasswordToCheck)
          return await Encryption.comparePassword(plainPassword, hashedPasswordToCheck)

        const record = await this.findBy({ username_email: username })
        if (record) {
          const pwHash = record.password_hash
          return await Encryption.comparePassword(plainPassword, pwHash)
        }

        throw new Error(`No user with username: ${username}`)
      },

      async hashPassword(plainPassword) {
        return await Encryption.hashPassword(plainPassword)
      },

      generateVerificationCode() {
        return uuidv1()
      },

      generateTempPassword(length=18) {
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        const newPw = new Array(length).fill(0).map(v => possible.charAt(Math.floor(Math.random() * possible.length))).join('')

        if (!this.passwordHasMinimumRequirements(newPw))
          return this.generateTempPassword(length)

        return newPw
      },

      passwordHasMinimumRequirements(proposedPassword) {
        const lower = 'abcdefghijklmnopqrstuvwxyz'
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const numbers = '0123456789'
        const special = `~!@#$%^&*()-_=+[{}]\|;:'",./<>?`

        if (proposedPassword.length < 8)
          return false

        let numCharacterClasses = 0;
        [ lower, upper, numbers, special ].forEach(charClass => {
          if (charClass.split('').some(char => proposedPassword.includes(char)))
            numCharacterClasses++
        })

        if (numCharacterClasses < 3)
          return false

        return true
      },

      async setSession(object, sessionObj=session, persistSession=true) {
        return await sessionHandler.setSession(object, sessionObj, persistSession)
      },

      getLoggedInUser() {
        return sessionHandler.getLoggedInUserId(true)
      },

      getLoggedInUserId() {
        return sessionHandler.getLoggedInUserId()
      },

      isLoggedIn() {
        if (session && session.toString() === '[object Object]') {
          if (Object.keys(session.user || {}).length > 0)
            return true
        }
        return false
      },

      async login(userObject=this.record) {
        if (session) {
          session.user = session.user || {}
          userObject = Object.assign(session.user, userObject || {})
          return await this.setSession({ user: userObject })
        }
        return false
      },

      async logout(nullifySession=true) {
        return await new Promise((resolve, reject) => {
          if (session) {
            return session.destroy(err => {
              if (err)
                return reject(err)
              
              // if (nullifySession)
              //   session = null
                
              resolve(true)
            })
          }

          resolve(false)
        })
      }
    }
  )
}
