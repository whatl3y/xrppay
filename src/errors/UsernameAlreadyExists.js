export default class UsernameAlreadyExists extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, UsernameAlreadyExists)

    this.redirectRoute = '/autherror/usernamealreadyexists'
  }
}
