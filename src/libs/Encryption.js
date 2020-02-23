import crypto from 'crypto'
import fs from 'fs'
import bcrypt from 'bcrypt'
import config from '../config'

export default class Encryption {
  constructor(options) {
    options = options || {}
    this._algorithm = options.algorithm || config.cryptography.algorithm
    this._secret = options.secret || config.cryptography.password
  }

  encrypt(text) {
    const secret      = getFilledSecret(this._secret, this.getAlgorithmKeyLength())
    const { iv, key } = getKeyAndIV(secret)
    const cipher      = crypto.createCipheriv(this._algorithm, key, iv)

    let cipherText = cipher.update(text, 'utf8', 'hex')
    cipherText += cipher.final('hex')
    return `${cipherText}:${iv.toString('hex')}`
  }

  decrypt(text) {
    const [ raw, ivHex ] = text.split(':')
    const iv          = Buffer.from(ivHex, 'hex')
    const secret      = getFilledSecret(this._secret, this.getAlgorithmKeyLength())
    const key         = (secret instanceof Buffer) ? secret : Buffer.from(secret)
    const decipher    = crypto.createDecipheriv(this._algorithm, key, iv)

    let dec = decipher.update(raw, 'hex', 'utf8')
    dec += decipher.final('utf8')
    return dec
  }

  fileToHash(filePath) {
    return new Promise((resolve, reject) => {
      filePath = filePath
      const md5Sum = crypto.createHash("md5")

      const s = fs.ReadStream(filePath)
      s.on("data", data => md5Sum.update(data))
      s.on("error", err => reject(err))
      s.on("end", () => resolve(md5Sum.digest("hex")))
    })
  }



  getAlgorithmKeyLength() {
    const map = {
      "des-ede3": 24,
      "aes128": 16,
      "aes-128-cbc": 16,
      "aes192": 24,
      "aes256": 32
    }
    return map[this._algorithm]
  }

  static stringToHash(string) {
    const md5Sum = crypto.createHash("md5")
    md5Sum.update(string)
    return md5Sum.digest("hex")
  }

  static async hashPassword(plainPassword, saltRounds=10) {
    return await bcrypt.hash(plainPassword, saltRounds)
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }
}


// Private methods
function getFilledSecret(secret, numBytes=32) {
  if (secret.length < numBytes)
    return getFilledSecret(`${secret}_${secret}`, numBytes)
  return secret.slice(0, numBytes)
}

function getKeyAndIV(key) {
  const ivBuffer = crypto.randomBytes(16)
  const keyBuffer = (key instanceof Buffer) ? key : Buffer.from(key)
  return { iv: ivBuffer, key: keyBuffer }
}
