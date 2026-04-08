require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve your frontend files from the project root
app.use(express.static(path.join(__dirname)));

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('ERROR: EMAIL_USER and EMAIL_PASS must be set in .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection verification failed:', error);
  } else {
    console.log('SMTP connection verified, ready to send emails:', success);
  }
});

app.post('/send-email', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    replyTo: `${name} <${email}>`,
    to: process.env.EMAIL_USER,
    subject: subject ? `${subject} (from ${name})` : `Portfolio message from ${name}`,
    text: `Sender: ${name} <${email}>\nSubject: ${subject || 'No subject'}\n\n${message}`,
    html: `<p><strong>Sender:</strong> ${name} &lt;${email}&gt;</p><p><strong>Subject:</strong> ${subject || 'No subject'}</p><p>${message.replace(/\n/g, '<br>')}</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email sent' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Failed to send email', error: error.toString() });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Email server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Use a different PORT in .env or stop the existing process.`);
    process.exit(1);
  }
  console.error('Server error', err);
  process.exit(1);
});
