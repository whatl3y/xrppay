export default class PasswordsNotMatch extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, PasswordsNotMatch)

    this.redirectRoute = '/autherror/passwordsdonotmatch'
  }
}
