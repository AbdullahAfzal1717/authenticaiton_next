import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import { MailtrapTransport } from "mailtrap";
import nodemailer from "nodemailer";

export const sendEmail = async ({
  email,
  emailType,
  userId,
}: {
  email: string;
  emailType: "VERIFY" | "RESET";
  userId: string;
}) => {
  const mailerToken = process.env.MAILER_TOKEN;

  if (!mailerToken) {
    throw new Error("MAILER_TOKEN is missing. Add it to your .env file.");
  }

  try {
    const hashedToken = await bcrypt.hash(userId.toString(), 10);

    if (emailType == "VERIFY") {
      await User.findByIdAndUpdate(userId, {
        verifyToken: hashedToken,
        verifyTokenExpiration: Date.now() + 3600000,
      });
    } else if (emailType == "RESET") {
      await User.findByIdAndUpdate(userId, {
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiration: Date.now() + 3600000,
      });
    }

    const transport = nodemailer.createTransport(
      MailtrapTransport({
        token: mailerToken,
      })
    );
    const mailOptions = {
      from: "hello@abdullah.com",
      to: email,
      subject:
        emailType === "VERIFY" ? "Verify your email" : "Reset your password",
      html: `<p>Click <a href="${
        process.env.DOMAIN
      }/verifyemail?token=${hashedToken}">here</a> to ${
        emailType === "VERIFY" ? "verify your email" : "reset your password"
      }
            or copy and paste the link below in your browser. <br> ${
              process.env.DOMAIN
            }/verifyemail?token=${hashedToken}
            </p>`,
    };

    const info = await transport.sendMail(mailOptions);
    return info;
  } catch (error: any) {
    throw new Error("Error sending email", error.message);
  }
};
