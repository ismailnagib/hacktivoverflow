require('dotenv').config()
const CronJob = require('cron').CronJob
const kue = require('kue')
const queue = kue.createQueue()
const nodemailer = require('nodemailer')

console.log("Background jobs are running . . .")

queue.process('email', function (job, done) {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        auth: {
            type: 'OAuth2',
            user: 'backgroundjobtest@gmail.com',
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: process.env.ACCESS_TOKEN
        }
    })

    let mailOptions = {
        from: 'backgroundjobtest@gmail.com',
        to: job.data.to,
        subject: job.data.title,
        html: job.data.template
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        } else {
            console.log('Message sent: %s', info.messageId);
        }
    });
});