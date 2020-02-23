import fs from 'fs'
import path from 'path'
import util from 'util'
import pug from 'pug'
import nodemailer from 'nodemailer'
import sgMail from '@sendgrid/mail'
import config from '../config'

const readFile = util.promisify(fs.readFile)

export default function Mailer(transportConfig=config.mailer.transporterConfig) {
  return {
    // https://www.npmjs.com/package/@sendgrid/mail
    // const messageObj = {
    //   to: 'test@example.com',
    //   from: 'test@example.com',
    //   subject: 'Sending with SendGrid is Fun',
    //   text: 'and easy to do anywhere, even with Node.js',
    //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    // }
    async send(messageObj, apiKey=config.mailer.sendgrid.key) {
      sgMail.setApiKey(apiKey)
      return await sgMail.send({ from: transportConfig.auth.user, ...messageObj })
    },

    // DEPRECATED: The following can be used if you have nodemailer
    // configuration
    transporter: nodemailer.createTransport(transportConfig),
    async sendNodeMailer(manualConfig={}) {
      // config needs from:, to:, subject:, and text: OR html: at a minimum
      // see usage here: https://nodemailer.com/usage/
      // see all options here: https://nodemailer.com/message/
      const mailOptions = Object.assign({ from: transportConfig.auth.user }, manualConfig)
      return await this.transporter.sendMail(mailOptions)
    }
  }
}

export let MailerHelpers = {
  async getTemplateHtml(filePath, options={}) {
    const extension = path.extname(filePath)

    switch(extension) {
      case '.pug':
        return pug.renderFile(filePath, options)

      default:  // .html, meaning no compilation is needed
        return await readFile(filePath, { encoding: 'utf8' })
    }
  },

  baseOptions(extraOptions={}) {
    return Object.assign({ host: config.server.host }, extraOptions)
  }
}
