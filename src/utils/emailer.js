const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'Info.AceMarket@gmail.com',
        pass: 'AceMarket@201306'
    }
});

const mailOptions = {
    from: 'Info.AceMarket@gmail.com',
    //to: 'myfriend@yahoo.com',
    //subject: 'Sending Email using Node.js',
    //text: 'That was easy!'
    //html: '<h1>Welcome</h1><p>That was easy!</p>'
};

// Check for html https://nodemailer.com/message/
exports.sendEmail = (to, subject, html, success, failure) => {
    const options = {
        ...mailOptions,
        to,
        subject,
        html,
    }

    transporter.sendMail(options, function (error, info) {
        if (error) {
            console.log(error);
            failure(error);
        } else {
            console.log('Email sent: ' + info.response);
            success(info);
        }
    });
}