import { generateVerificationOtpEmailTemplate } from "./emailTemplate.js";
import { sendEmail } from "./sendEmail.js";
export async function sendVerificationCode(verificationCode, email) {
  try {
    const message = generateVerificationOtpEmailTemplate(verificationCode);
    await sendEmail({
      email,
      subject: "Verification code (Bookworm Library Management System)",
      message,
    });
    return { success: true, message: "Verification code sent successfully" };
  } catch (error) {
    // LOG THE ERROR TO YOUR BACKEND CONSOLE
    console.error("EMAIL SEND ERROR: ", error);
    return { success: false, message: "Verification code failed to send." };
  }
}
