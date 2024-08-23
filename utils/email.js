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
    text: options.message,
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
  const message = `Your verification code is: ${code}`;

  const options = {
    email: recipientEmail,
    subject: subject,
    message: message,
  };

  await sendEmail(options);
};
