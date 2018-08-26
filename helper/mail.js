const nodemailer = require('nodemailer');
const debuug = require('debug')('mixdown:mail');

async function credentials(){
    try{
        let account = await nodemailer.createTestAccount();
        return Promise.resolve(account);
    }catch (err) {
        return Promise.reject(err);
    }
}

async function sendMail(options){
    try {
        const account = await credentials();
        let transportOptions = {
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: account.user, // generated ethereal user
                pass: account.pass // generated ethereal password
            }
        };

        const transporter = nodemailer.createTransport(transportOptions);

        let mailOptions = {
            from: options.user || account.user,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };

        let info = await transporter.sendMail(mailOptions);
        debug(info);
    }catch (err) {
        debug(err);
    }
}

module.exports = sendMail;