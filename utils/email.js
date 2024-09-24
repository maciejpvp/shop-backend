import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: "Maciek <hello@maciek.io>",
    to: options.email,
    subject: options.subject,
    html: options.message,
  };
  await transporter.sendMail(mailOptions);
};

export const sendEmailVerifyCodeMail = async (code, recipientEmail) => {
  const subject = "Your Verification Code";
  const message = `Your verification code is: ${code}`;

  const options = {
    email: recipientEmail,
    subject: subject,
    message: message,
  };

  await sendEmail(options);
};

export const sendPasswordResetToken = async (code, recipientEmail) => {
  const subject = "Password Reset";
  const resetLink = `http://localhost:5173/auth/resetPassword/${code}`;
  const message = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
        text-align: center;
      }
      .container {
        max-width: 600px;
        margin: 50px auto;
        background-color: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .button {
        display: inline-block;
        background-color: #000;
        color: #fff;
        padding: 15px 30px;
        margin: 20px 0;
        text-decoration: none;
        font-size: 18px;
        border-radius: 5px;
      }
      .message {
        font-size: 16px;
        color: #333;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Password Reset Request</h2>
      <p class="message">Click the button below to reset your password:</p>
      <a href="${resetLink}" class="button">Reset Password</a>
      <p class="message">If you did not request a password reset, you can ignore this email.</p>
    </div>
  </body>
  </html>
`;
  const options = {
    email: recipientEmail,
    subject: subject,
    message: message,
  };

  await sendEmail(options);
};
