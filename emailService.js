const nodemailer = require("nodemailer");

// Function to send an email
const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,  // Your Gmail address
        pass: process.env.EMAIL_PASS,  // Your App Password
      },
    });
    

    const mailOptions = {
      from: "your-email@gmail.com", // Sender's email
      to: to,                       // Recipient's email
      subject: subject,             // Email subject
      text: text,                   // Email content
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);

  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Export the sendEmail function
module.exports = sendEmail;