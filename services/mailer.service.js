"use strict";

const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const mailer = require("../config/mailer.json");

/**
 * init function
 * returns transporter
 */
async function init() {
  const oAuth2Client = new google.auth.OAuth2(
    mailer.OAuth2.clientId,
    mailer.OAuth2.clientSecret,
    mailer.OAuth2.redirectUri
  );
  oAuth2Client.setCredentials({ refresh_token: mailer.OAuth2.refreshToken });

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

  let transporter = nodemailer.createTransport(transporterOptions);

  return transporter;
}

/**
 * send mail
 */
async function sendMail({ to, subject, text }) {
  let transporter = await init();

  let payload = {
    from: `"Test Space 👻" <${mailer.user}>`,
    to: (Array.isArray(to) && to.join()) || to,
    subject,
    text,
  };

  let info = await transporter.sendMail(payload);

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

/**
 * send verification code
 */
async function sendVerificationCode({ to, verifyCode }) {
  let transporter = await init();

  let info = await transporter.sendMail({
    from: `"Test Space 👻✉📝" <${mailer.user}>`,
    to: (Array.isArray(to) && to.join()) || to,
    subject: "Verify your account",
    html: `
        <b>Verification link</b> 
        <a href="http://testspace.com.tm:3007/v1/verify-code/${verifyCode}">${verifyCode}</a>
      `,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

/**
 * send forget password message
 */
async function sendForgetPasswordMessage({ to, verifyCode, link }) {
  let transporter = await init();

  link = link.replace(":code", verifyCode);

  let info = await transporter.sendMail({
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

async function sendTestInvitation({ to, link, userId }) {
  await sendMail({
    to,
    subject: `Invitation`,
    text: `You invited to solve test. Link: ${link}`,
  });
}

module.exports = {
  sendMail,
  sendVerificationCode,
  sendForgetPasswordMessage,
  sendTestInvitation,
};
