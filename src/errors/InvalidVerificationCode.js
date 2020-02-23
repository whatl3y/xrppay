export default class InvalidVerificationCode extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, InvalidVerificationCode)

    this.redirectRoute = '/autherror/invalidverifcode'
  }
}
