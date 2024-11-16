const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendConfirmationEmail = async (reservation) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: reservation.email,
            subject: 'Reservation Confirmation',
            html: `
                <h1>Reservation Confirmed!</h1>
                <p>Thank you for your reservation at ${reservation.restaurant}.</p>
                <h2>Reservation Details:</h2>
                <ul>
                    <li>Date: ${reservation.date}</li>
                    <li>Time: ${reservation.time}</li>
                    <li>Guests: ${reservation.guests}</li>
                    <li>Reservation ID: ${reservation.paymentId}</li>
                </ul>
                <p>A $20 deposit has been charged to your card and will be deducted from your final bill.</p>
                <p>If you need to modify or cancel your reservation, please contact us at least 24 hours in advance.</p>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send confirmation email');
    }
};

module.exports = { sendConfirmationEmail };
