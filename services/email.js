const nodemailer = require('nodemailer');

/**
 * Sends an email notification to the school when a new inquiry is submitted.
 * Uses Gmail SMTP with an App Password.
 */
async function sendInquiryEmail(inquiry) {
  // Only send if Gmail credentials are configured
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  if (!gmailUser || !gmailPass) {
    console.log('⚠️  Email not configured. Set GMAIL_USER and GMAIL_PASS in .env to enable emails.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass // Gmail App Password (not your regular password)
    }
  });

  const mailOptions = {
    from: `"VM Kotagi School Website" <${gmailUser}>`,
    to: gmailUser, // sends to the school's own Gmail
    subject: `📩 New Admission Inquiry - ${inquiry.student_name} (${inquiry.class_applying})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a3a5c, #c0392b); padding: 25px; text-align: center;">
          <h2 style="color: #fff; margin: 0; font-size: 1.3rem;">
            🏫 V.M. Kotagi Basava Samskruti School
          </h2>
          <p style="color: rgba(255,255,255,0.85); margin: 5px 0 0; font-size: 0.9rem;">
            New Admission Inquiry Received
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 25px; background: #fff;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px 15px; font-weight: bold; color: #555; width: 40%;">👨‍👩‍👧 Parent Name</td>
              <td style="padding: 12px 15px; color: #222;">${inquiry.parent_name}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; font-weight: bold; color: #555;">👦 Student Name</td>
              <td style="padding: 12px 15px; color: #222;">${inquiry.student_name}</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px 15px; font-weight: bold; color: #555;">📱 Phone</td>
              <td style="padding: 12px 15px; color: #c0392b; font-weight: bold; font-size: 1.1rem;">
                <a href="tel:${inquiry.phone}" style="color: #c0392b; text-decoration: none;">${inquiry.phone}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; font-weight: bold; color: #555;">📧 Email</td>
              <td style="padding: 12px 15px; color: #222;">${inquiry.email || 'Not provided'}</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px 15px; font-weight: bold; color: #555;">📚 Class Applying For</td>
              <td style="padding: 12px 15px; color: #222; font-weight: bold;">${inquiry.class_applying}</td>
            </tr>
            ${inquiry.message ? `
            <tr>
              <td style="padding: 12px 15px; font-weight: bold; color: #555;">💬 Message</td>
              <td style="padding: 12px 15px; color: #222;">${inquiry.message}</td>
            </tr>
            ` : ''}
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px 15px; font-weight: bold; color: #555;">🕐 Submitted At</td>
              <td style="padding: 12px 15px; color: #555; font-size: 0.9rem;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="background: #f0f2f5; padding: 15px 25px; text-align: center;">
          <p style="color: #888; font-size: 0.8rem; margin: 0;">
            View all inquiries in the 
            <a href="https://vm-kotagi-school.vercel.app/admin/inquiries" style="color: #c0392b;">Admin Panel</a>
            &nbsp;|&nbsp; V.M. Kotagi Basava Samskruti School, Hubballi
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Inquiry email sent to', gmailUser);
  } catch (err) {
    console.error('❌ Failed to send inquiry email:', err.message);
  }
}

module.exports = { sendInquiryEmail };
