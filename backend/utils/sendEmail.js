import * as brevo from "@getbrevo/brevo";

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY,
);

export const sendEmail = async ({ email, subject, message }) => {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.sender = {
    name: "Bookworm Library",
    email: process.env.BREVO_SENDER_EMAIL,
  };
  sendSmtpEmail.to = [{ email }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = message;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    const errMsg = error?.response?.body?.message || error.message;
    throw new Error(errMsg || "Failed to send email");
  }
};
