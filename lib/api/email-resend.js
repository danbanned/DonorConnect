// lib/api/email-resend.js (NEW - recommended)
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({ to, subject, html, text, cc, bcc }) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'DonorConnect <onboarding@resend.dev>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
      cc,
      bcc,
    })

    if (error) {
      console.error('❌ Resend API error:', error)
      throw error
    }

    console.log('📧 Email sent via Resend:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('❌ Failed to send email via Resend:', error)
    throw error
  }
}

export async function sendWelcomeEmail({ to, name, organizationName, loginUrl }) {
  try {
    const subject = `Welcome to DonorConnect, ${name}! 🎉`
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          /* ... same beautiful styles as before ... */
        </style>
      </head>
      <body>
        <!-- ... same HTML as before ... -->
      </body>
      </html>
    `

    return await sendEmail({
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('❌ Failed to send welcome email via Resend:', error)
    throw error
  }
}

// ... keep other functions the same