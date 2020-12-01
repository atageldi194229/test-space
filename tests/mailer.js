const { sendMail } = require('../services/mailer.service');
const mailer = require('../services/mailer.service');

(async () => {
    await mailer.sendVerificationCode({
        to: 'atageldi194229@gmail.com',
        verifyCode: '1234'
    });
    console.log('test finished.');
})();