export default class PasswordNotValid extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, PasswordNotValid)

    this.redirectRoute = '/autherror/invalidpassword'
  }
}
