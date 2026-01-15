import Mailgen from "mailgen";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config({
  path: "./.env",
});

const sendMail = async (options) => {
  const mailgenGenrator = new Mailgen({
    theme: "default",
    product: {
      name: "CeniDiary",
      link: process.env.FRONTEND_URL || "http://localhost:3000",
    },
  });

  const emailtextual = mailgenGenrator.generatePlaintext(
    options.mailgencontent
  );
  const emailhtml = mailgenGenrator.generate(options.mailgencontent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_Username,
      pass: process.env.MAILTRAP_SMTP_Password,
    },
  });

  const mail = {
    from: "mail.cenidiary@example.com",
    to: options.email,
    subject: options.subject,
    text: emailtextual,
    html: emailhtml,
  };

  try {
    await transporter.sendMail(mail);
    console.log("Email sent successfully to ", options.email);
  } catch (error) {
    console.log("Error sending email", error);
  }
};

const emailverifyMailcontent = (userName, verifyLink) => {
  return {
    body: {
      name: userName,
      intro: "Welcome to the app! We're very excited to have you on board.",
      action: {
        instructions: "To get started with your account, please verify here:",
        button: {
          color: "#22BC66",
          text: "Verify your account",
          link: verifyLink,
        },
      },
      outro:
        "If you did not sign up for this account, please ignore this email.",
    },
  };
};

const resetPasswordMailcontent = (userName, resetLink) => {
  return {
    body: {
      name: userName,
      intro: "You have requested to reset your password.",
      action: {
        instructions: "Please click the button below to reset your password:",
        button: {
          color: "#FF0000",
          text: "Reset your password",
          link: resetLink,
        },
      },
      outro:
        "If you did not request a password reset, please ignore this email.",
    },
  };
};

export { emailverifyMailcontent, resetPasswordMailcontent, sendMail };
