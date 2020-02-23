export default class IncorrectPasswordTooManyTries extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, IncorrectPasswordTooManyTries)

    this.redirectRoute = '/autherror/incorrectpasswordtoomanytries'
  }
}
