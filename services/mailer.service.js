"use strict";

const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const mailer = require("../config/mailer.json");

const oAuth2Client = new google.auth.OAuth2(
  mailer.OAuth2.clientId,
  mailer.OAuth2.clientSecret,
  mailer.OAuth2.redirectUri,
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

class Mailer {
  constructor() {
    const accessToken = await oAuth2Client.getAccessToken();
    // create reusable transporter object using the default SMTP transport
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      host: mailer.host,
      port: mailer.port,
      secure: mailer.secure, // true for 465, false for other ports
      auth: {
        type: "OAuth2",
        user: mailer.user,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken, 
        // user: mailerConfig.user, // testAccount.user, // generated ethereal user
        // pass: mailerConfig.pass, // testAccount.pass, // generated ethereal password
      },
    });
  }

  async sendMail({ to, subject, text }) {
    let info = await this.transporter.sendMail({
      from: `"Test Space 👻" <${mailer.user}>`,
      to,
      subject,
      text,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }

  async sendVerificationCode(obj) {
    let info = await this.transporter.sendMail({
      from: `"Test Space 👻✉📝" <${mailer.user}>`,
      to: `${obj.to}`,
      subject: "Verify your account",
      html: `
        <b>Verification link</b> 
        <a href="http://192.168.5.99:3007/v1/verify-code/${obj.verifyCode}">${obj.verifyCode}</a>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }

  async sendTestInvitation({ to, link, userId }) {
    let str = "";
    if (to.length > 0) str += to[0];
    for (let i = 1; i < to.length; i++) str += `,${to[i]}`;

    await this.sendMail({
      to: str,
      subject: `Invitation`,
      text: `You invited to solve test. Link: ${link}`,
    });
  }
}

module.exports = new Mailer();