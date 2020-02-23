export default class NoPassword extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, NoPassword)

    this.redirectRoute = '/autherror/nopassword'
  }
}
