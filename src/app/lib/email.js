import { Resend } from "resend"; // Recommended service
// or import nodemailer from 'nodemailer'; // Alternative

// Initialize Resend (recommended for Next.js)
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send a transactional email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.from] - Sender email (defaults to env variable)
 */
export async function sendEmail({ to, subject, html, from }) {
  try {
    const { data, error } = await resend.emails.send({
      from: from || process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email sending error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

/**
 * Send a daily digest email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {Array} options.articles - Array of articles to include
 */
export async function sendDigestEmail({ to, articles }) {
  // You'll need to create this template (see below)
  const html = generateDigestTemplate(articles);

  return sendEmail({
    to,
    subject: "Your Daily Digest",
    html,
  });
}

// Helper function to generate HTML template
function generateDigestTemplate(articles) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          /* Add your email styles here */
        </style>
      </head>
      <body>
        <h1>Daily Digest</h1>
        ${articles
          .map(
            (article) => `
          <div class="article">
            <h2>${article.title}</h2>
            <p>${article.summary}</p>
            <a href="${article.url}">Read more</a>
          </div>
        `
          )
          .join("")}
      </body>
    </html>
  `;
}

// Alternative using Nodemailer (if you prefer)
/*
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
*/
