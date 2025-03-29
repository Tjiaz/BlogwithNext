// app/lib/email.js
import nodemailer from "nodemailer";

// Create transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content of the email
 * @param {string} [options.text] - Plain text version of the email
 * @returns {Promise} Promise that resolves when email is sent
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""), // Fallback to HTML without tags
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Test email connection on startup
(async () => {
  try {
    await transporter.verify();
    console.log("Server is ready to send emails");
  } catch (error) {
    console.error("Error verifying email server:", error);
  }
})();
