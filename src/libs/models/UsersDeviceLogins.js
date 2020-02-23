import DatabaseModel from './DatabaseModel'
import Encryption from '../Encryption'

export default function UsersDeviceLogins(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'users_device_logins')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'user_id',
        'device_signature',
        'last_ip_address',
        'last_device_login'
      ],

      hash(str) {
        return Encryption.stringToHash(str)
      }
    }
  )
}
