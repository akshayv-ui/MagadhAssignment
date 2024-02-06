const Bull = require('bull');
const sendMail = require('../helpers/nodemailer').default;
const async = require('async');
const queue = new Bull('sendMailQueue');

queue.process('sendEmailQueue', async (job) => {
    const { sendEmailData } = job.data;
    const errors = [];
    let progress = 0;

    const email = async (data) => {
        const { to, subject, text } = data;

        try {
            const emailData = await sendMail({ to, subject, text });
            job.log(`Email sent to ${to}`, emailData);
        } catch (error) {
            errors.push(error);
        }

        progress++;
        const percentage = Math.floor((progress / sendEmailData.length) * 100);
        await job.progress(percentage);
    };

    await async.eachLimit(sendEmailData, 10, email);

    await job.log('Emails sent successfully');
    await job.progress(100);
    await job.moveToCompleted('Emails sent successfully');

    if (errors.length > 0) {
        job.log('Errors occurred while sending emails:');
        job.log(errors);
    }
});

exports.sendEmailQueue = queue;