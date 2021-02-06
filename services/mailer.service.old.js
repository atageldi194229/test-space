"use strict";

const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const mailer = require("../config/mailer.json");

const oAuth2Client = new google.auth.OAuth2(
  mailer.OAuth2.clientId,
  mailer.OAuth2.clientSecret,
  mailer.OAuth2.redirectUri
);
oAuth2Client.setCredentials({ refresh_token: mailer.OAuth2.refreshToken });

class Mailer {
  constructor() {}

  async init() {
    let accessToken = await oAuth2Client.getAccessToken();
    console.log(accessToken);

    const transporterOptions = {
      service: "gmail",
      // host: mailer.host,
      // port: mailer.port,
      // secure: mailer.secure,
      auth: {
        type: "OAuth2",
        user: mailer.user,
        clientId: mailer.OAuth2.clientId,
        clientSecret: mailer.OAuth2.clientSecret,
        refreshToken: mailer.OAuth2.refreshToken,
        accessToken,
      },
    };

    this.transporter = nodemailer.createTransport(transporterOptions);
  }

  async sendMail({ to, subject, text }) {
    await this.init();

    let payload = {
      from: `"Test Space 👻" <${mailer.user}>`,
      to: (Array.isArray(to) && to.join()) || to,
      subject,
      text,
    };

    let info = await this.transporter.sendMail(payload);

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }

  async sendVerificationCode(obj) {
    await this.init();

    let info = await this.transporter.sendMail({
      from: `"Test Space 👻✉📝" <${mailer.user}>`,
      to: (Array.isArray(to) && to.join()) || to,
      subject: "Verify your account",
      html: `
        <b>Verification link</b> 
        <a href="http://testspace.com.tm:3007/v1/verify-code/${obj.verifyCode}">${obj.verifyCode}</a>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }

  async sendForgetPasswordMessage({ to, verifyCode, link }) {
    await this.init();

    link = link.replace(":code", verifyCode);

    let info = await this.transporter.sendMail({
      from: `"Change account password Test Space 👻✉📝" <${mailer.user}>`,
      to,
      subject: "Change account password",
      html: `
        <b>To change account password open this link: </b> 
        <a href="${link}">${verifyCode}</a>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }

  async sendTestInvitation({ to, link, userId }) {
    await this.sendMail({
      to,
      subject: `Invitation`,
      text: `You invited to solve test. Link: ${link}`,
    });
  }
}

module.exports = new Mailer();
