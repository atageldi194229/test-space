const { sendMail } = require("../services/mailer.service");
const mailer = require("../services/mailer.service");

(async () => {
  await mailer.sendMail({
    to: "atageldi194229@gmail.com",
    subject: "Nodemailter test space",
    text: "Nodemailer works properly",
  });
  console.log("test finished.");
})();

/*
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const mailer = require("../config/mailer.json");

(async () => {
  console.log(mailer);
  const oAuth2Client = new google.auth.OAuth2(
    mailer.OAuth2.clientId,
    mailer.OAuth2.clientSecret,
    mailer.OAuth2.redirectUri
  );

  oAuth2Client.setCredentials({ refresh_token: mailer.OAuth2.refreshToken });

  const transporterOptions = {
    service: "gmail",
    // host: mailer.host,
    // port: mailer.port,
    // secure: mailer.secure,
    auth: {
      type: "OAuth2",
      user: mailer.user,
      clientId: mailer.clientId,
      clientSecret: mailer.clientSecret,
      refreshToken: mailer.refreshToken,
    },
  };

  transporterOptions.auth.accessToken = (
    await oAuth2Client.getAccessToken()
  ).token;

  console.log(transporterOptions.auth.accessToken);

  const transporter = nodemailer.createTransport(transporterOptions);
  let info = await transporter.sendMail({
    from: `"Test Space 👻" <${mailer.user}>`,
    to: "atageldi194229@gmail.com",
    subject: "Nodemailter test space",
    text: "LINK: asd",
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
})();

*/
