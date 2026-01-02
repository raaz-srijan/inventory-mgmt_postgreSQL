const transporter = require('./transporter');

async function sendRegistrationConfirmation(to) {
    try {
        const html = `
            <h2>Thank You for Registering!</h2>
            <p>We are excited to have you on board. Our team is currently reviewing your details.</p>
            <p>Once your details are verified, you will receive an approval notification, and you can start using our platform.</p>
            <p>Thank you for your patience!</p>
            <p>Best Regards,<br>Company name</p>
        `;

        const mailOptions = {
            from: process.env.SMTP_USER,
            to,
            subject: "Thank you for registering – Your details are being verified",
            html
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending mail:", error);
    }
}

module.exports = sendRegistrationConfirmation;
