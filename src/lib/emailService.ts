import { toast } from 'sonner';

interface EmailPayload {
  to: string;
  subject: string;
  bodyHtml: string;
}

export const sendEmail = async ({ to, subject, bodyHtml }: EmailPayload) => {
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'SecureVote <onboarding@resend.dev>',
          to,
          subject,
          html: bodyHtml,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resend API error: ${errorText}`);
      }

      console.log(`[Email sent via Resend] To: ${to}, Subject: ${subject}`);
      toast.success(`Email notification sent to ${to}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to send email via Resend API:', error);
      toast.error(`Resend API failed, falling back to mock delivery.`);
    }
  }

  // Fallback / Mock delivery
  console.log('%c--- MOCK EMAIL SENT ---', 'color: #00ff00; font-weight: bold;');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body (HTML): ${bodyHtml}`);
  console.log('------------------------');

  toast.info(`Mock Email Sent To: ${to}`, {
    description: `Subject: ${subject}. Check developer console for HTML payload.`,
    duration: 6000,
  });

  return { success: true, mock: true };
};
