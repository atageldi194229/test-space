"use strict";

const nodemailer = require("nodemailer");
const mailerConfig = require("../config/mailer");

class Mailer {
  constructor() {
    // create reusable transporter object using the default SMTP transport
    this.transporter = nodemailer.createTransport({
      host: mailerConfig.host,
      port: mailerConfig.port,
      secure: mailerConfig.secure, // true for 465, false for other ports
      auth: {
        user: mailerConfig.user, // testAccount.user, // generated ethereal user
        pass: mailerConfig.pass, // testAccount.pass, // generated ethereal password
      },
    });
  }

  async sendMail(obj) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // let testAccount = await nodemailer.createTestAccount();

    // send mail with defined transport object
    let info = await this.transporter.sendMail({
      from: `"Test Space 👻" <${mailerConfig.user}>`, // sender address
      to: `${obj.to}`, // "bar@example.com, baz@example.com", // list of receivers
      subject: "Verification", // Subject line
      text: "Authentication", // plain text body
      // html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }

  async sendVerificationCode(obj) {
    // send mail with defined transport object
    let info = await this.transporter.sendMail({
      from: `"Test Space 👻✉📝" <${mailerConfig.user}>`, // sender address
      to: `${obj.to}`, // "bar@example.com, baz@example.com", // list of receivers
      subject: "Verify your account", // Subject line
      // text: "Authentication", // plain text body
      html: `
        <b>Verification link</b> 
        <a href="http://192.168.5.99:3007/v1/verify-code/${obj.verifyCode}">${obj.verifyCode}</a>
      `, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }
}

module.exports = new Mailer();

/*

let message = {
    ...
    html: 'Embedded image: <img src="cid:unique@nodemailer.com"/>',
    attachments: [{
        filename: 'image.png',
        path: '/path/to/file',
        cid: 'unique@nodemailer.com' //same cid value as in the html img src
    }]
}

*/
