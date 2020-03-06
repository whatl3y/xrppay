export default {
  SET_PRIVACY_ACTIVE_CARD(state, cardRecord) {
    state.privacy.card = cardRecord
  },

  SET_PRIVACY_CARD_EXPIRATION_TIME(state, expTimeSeconds) {
    state.privacy.activeExpirationSeconds = expTimeSeconds
  }
}
