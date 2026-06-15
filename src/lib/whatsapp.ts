import twilio from "twilio";

const hasTwilioConfig =
  Boolean(process.env.TWILIO_ACCOUNT_SID) &&
  Boolean(process.env.TWILIO_AUTH_TOKEN) &&
  Boolean(process.env.TWILIO_WHATSAPP_NUMBER);

const client = hasTwilioConfig
  ? twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    )
  : null;

export async function sendWhatsApp(
  to: string,
  message: string
) {
  if (!client || !process.env.TWILIO_WHATSAPP_NUMBER || !to) {
    return null;
  }

  return client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${to}`,
    body: message,
  });
}
