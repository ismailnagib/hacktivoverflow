require('dotenv').config()
const CronJob = require('cron').CronJob
const kue = require('kue')
const queue = kue.createQueue()
const nodemailer = require('nodemailer')
const mongoose = require('mongoose')
const User = require('./models/userModel')
const Question = require('./models/questionModel')
const Answer = require('./models/answerModel')

mongoose.connect(`mongodb://localhost:27017/wonder-hackover`, { useNewUrlParser: true });

console.log("Background jobs are running . . .")

queue.process('email', function (job, done) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'backgroundjobtest@gmail.com',
            pass: process.env.EMAIL_PASSWORD
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
            done()
        }
    });
});

new CronJob('0 9 1 * *', function () {
    console.log('CronJob running . . .')
    var date = new Date("21/08/2000")
    var locale = "en-id"
    var month = date.toLocaleString(locale, { month: "long" })
    var year = new Date().getFullYear()
    User.find()
    .then(data => {
        for (let i = 0; i < data.length; i++) {
            Question.find({
                author: data[i]._id
            })
            .then(questions => {
                Answer.find({
                    answerer: data[i]._id
                })
                .then(answers => {
                    queue.create('email', {  
                        title: `Your month in review (${month} ${year})`,
                        to: data[i].email,
                        template: `<h2>Hi, ${data[i].name}.</h2>
                        <p>This is your month in review.</p><br>
                        <p>You asked <span style='color: green; font-size: 20px'>${questions.length}</span> question(s),</p>
                        <p>and gave <span style='color: blue; font-size: 20px'>${answers.length}</span> answer(s).</p><br>
                        <p><b>That's awesome!</b></p><br>
                        <p>With love,</p>
                        <p><strong>The Hackerflow Team</strong></p>`
                    }).save()
                })
                .catch(err => {
                    console.log(err)
                })
            })
            .catch(err => {
                console.log(err)
            })
        }
    })
    .catch(err => {
        console.log(err)
    })
}, null, true, 'Asia/Jakarta')