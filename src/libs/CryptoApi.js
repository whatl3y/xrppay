import request from 'request-promise-native'
// import config from '../config'

export default function CryptoApi() {
  return {
    request: request.defaults({
      baseUrl: `https://api.coinbase.com/v2`,
      json: true
    }),

    async usdBuyPrice(code='xrp') {
      return await this.usdPriceBase('buy', code)
    },
    
    async usdSellPrice(code='xrp') {
      return await this.usdPriceBase('sell', code)
    },

    async usdSpotPrice(code='xrp') {
      return await this.usdPriceBase('spot', code)
    },

    async usdPriceBase(type, destinationCode) {
      return await this.request.get(`/prices/${destinationCode.toUpperCase()}-USD/${type}`)
    }
  }
}