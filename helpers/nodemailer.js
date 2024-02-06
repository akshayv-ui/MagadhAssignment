// Require Nodemailer
const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mayankrajput9354@gmail.com',
        pass: 'buci wgvu ktyy rzhw'
    }
});

const sendMail = async (data) => {
    const { to, subject, text } = data;

    const mailOptions = {
        from: 'mayankrajput9354@gmail.com'
        , to
        , subject
        , text
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log('Error sending email to', error);
        throw error;
    }
};

exports.default = sendMail;
