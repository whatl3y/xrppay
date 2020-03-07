import XrppayFetch from './XrppayFetch'
import { handleFetchResponse } from './ApiHelpers'

export default {
  isValidEmail(text='') {
    return /^.+@.+\.([a-zA-Z\d]{1,15})$/.test(text || '')
  },

  async getSession() {
    const response = await XrppayFetch(`/api/1.0/auth/session`)
    return await handleFetchResponse(response)
  },

  async resendVerification() {
    const response = await XrppayFetch(`/api/1.0/auth/resend/verification`)
    return await handleFetchResponse(response)
  },

  async forgotPassword(email) {
    const response = await XrppayFetch(`/api/1.0/auth/password/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    return await handleFetchResponse(response)
  },

  async resetPassword({ current_password, new_password }) {
    const response = await XrppayFetch(`/api/1.0/auth/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password, new_password })
    })
    return await handleFetchResponse(response)
  }
}
