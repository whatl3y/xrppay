import DatabaseModel from './DatabaseModel'

export default function CryptoWallet(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'crypto_wallet')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'user_id',
        'type',
        'public_addr',
        'private_key',
        'mod1',
        'mod2',
        'mod3'
      ]
    }
  )
}
