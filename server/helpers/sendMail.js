const nodemailer = require('nodemailer');
const config = require('../config');

const sendEmail = async (sendToEmail, template) => {
  // Check if SMTP is configured (not using placeholder values)
  const isSMTPConfigured = 
    config.SMTP_HOST && 
    config.SMTP_USER && 
    config.SMTP_PW &&
    !config.SMTP_HOST.includes('placeholder') &&
    !config.SMTP_USER.includes('placeholder') &&
    !config.SMTP_PW.includes('placeholder');

  if (!isSMTPConfigured) {
    console.log('SMTP not configured, skipping email send to:', sendToEmail);
    return;
  }

  const { subject, text, html } = template;

  try {
    const transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PW,
      },
    });

    const message = {
      from: `${config.FROM_NAME} <${config.FROM_EMAIL}>`,
      to: sendToEmail,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error.message);
    // Don't throw - email failure shouldn't break registration
  }
};

module.exports = sendEmail;
