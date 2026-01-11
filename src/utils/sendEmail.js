const transporter = require("./transporter");

const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

const sendRegistrationEmail = async (user, business) => {
    const subject = "Welcome to Inventory-Mgmt - Registration Successful";
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2c3e50;">Welcome to Inventory-Mgmt!</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your business <strong>${business.name}</strong> has been successfully registered on our platform.</p>
            <p>Our administrators are currently reviewing your documents. You will receive another email once your account is verified.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>What's next?</strong></p>
                <ul style="margin-top: 10px;">
                    <li>Wait for verification</li>
                    <li>Set up your inventory items</li>
                    <li>Add your team members</li>
                </ul>
            </div>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>Best regards,<br>The Inventory-Mgmt Team</p>
        </div>
    `;
    await sendEmail(user.email, subject, html);
};

const sendVerificationEmail = async (user, isVerified) => {
    const status = isVerified ? "Verified" : "Rejected/Pending";
    const subject = `Account Status Update: Business ${status}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: ${isVerified ? '#27ae60' : '#e74c3c'};">Business Status Updated</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>The verification status for your business has been updated to: <strong>${status}</strong>.</p>
            ${isVerified
            ? '<p>Congratulations! You can now access all features of the platform, including staff management and inventory tracking.</p>'
            : '<p>Unfortunately, your business verification was not successful at this time. Please contact support or re-upload your documents if necessary.</p>'}
            <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 20px;">Go to Dashboard</a>
            <p>Best regards,<br>The Inventory-Mgmt Team</p>
        </div>
    `;
    await sendEmail(user.email, subject, html);
};

const sendStaffWelcomeEmail = async (user, tempPassword, role) => {
    const subject = `Welcome to the Team - Your Account is Ready`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2c3e50;">You've Been Added as a ${role}!</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your account on Inventory-Mgmt has been created by your business owner.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Login Credentials:</strong></p>
                <p>Email: <strong>${user.email}</strong></p>
                <p>Temporary Password: <strong style="color: #e67e22;">${tempPassword}</strong></p>
            </div>
            <p style="color: #7f8c8d; font-size: 0.9em;">Please log in and change your password immediately.</p>
            <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px; margin-top: 20px;">Login Now</a>
            <p>Best regards,<br>The Management</p>
        </div>
    `;
    await sendEmail(user.email, subject, html);
};

const sendBusinessApprovalEmail = async (user) => {
    const subject = "Business Approved - Welcome to Inventory-Mgmt";
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #27ae60;">Congratulations! Your Business is Approved</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>We are pleased to inform you that your business registration has been verified and approved.</p>
            <p>You can now log in to your dashboard and start managing your inventory and staff.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 12px 25px; background-color: #27ae60; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
            </div>

            <p>Best regards,<br>The Inventory-Mgmt Team</p>
        </div>
    `;
    await sendEmail(user.email, subject, html);
};

const sendTicketUpdateEmail = async (user, ticket, newStatus) => {
    const subject = `Ticket Update: [#${ticket.id}] ${ticket.title}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2c3e50;">Your Ticket Status Has Changed</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>The ticket you reported has been updated.</p>
            <div style="border-left: 4px solid #3498db; padding-left: 15px; margin: 20px 0;">
                <p><strong>Ticket:</strong> ${ticket.title}</p>
                <p><strong>New Status:</strong> <span style="text-transform: uppercase; font-weight: bold;">${newStatus}</span></p>
            </div>
            <p>Our team is working on it. Thank you for your patience.</p>
            <p>Best regards,<br>Support Team</p>
        </div>
    `;
    await sendEmail(user.email, subject, html);
};

const sendPasswordResetEmail = async (user, resetLink) => {
    const subject = "Password Reset Request - Inventory-Mgmt";
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2c3e50;">Password Reset Request</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
            <p>Please click on the following button to complete the process:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="display: inline-block; padding: 12px 25px; background-color: #e67e22; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset My Password</a>
            </div>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            <p>This link will expire in 1 hour.</p>
            <p>Best regards,<br>The Inventory-Mgmt Team</p>
        </div>
    `;
    await sendEmail(user.email, subject, html);
};

module.exports = {
    sendRegistrationEmail,
    sendVerificationEmail,
    sendStaffWelcomeEmail,
    sendTicketUpdateEmail,
    sendBusinessApprovalEmail,
    sendPasswordResetEmail
};
