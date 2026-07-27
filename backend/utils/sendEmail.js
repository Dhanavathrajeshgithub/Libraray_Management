import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ email, subject, message }) => {
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM, // e.g. "Bookworm <onboarding@yourdomain.com>"
    to: email,
    subject,
    html: message,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }
};
