export default class InvalidEmailAddress extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, InvalidEmailAddress)

    this.redirectRoute = '/autherror/invalidemail'
  }
}
