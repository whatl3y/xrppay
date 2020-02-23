export default class IncorrectPassword extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, IncorrectPassword)

    this.redirectRoute = '/autherror/incorrectpassword'
  }
}
