import nodemailer from 'nodemailer'

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: process.env.EMAIL_SERVER_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email server connection failed:', error)
  } else {
    console.log('Email server is ready to send messages')
  }
})

export async function sendEmail({ to, subject, html, text, cc, bcc }) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@donorconnect.app',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
      cc,
      bcc,
    }

    const info = await transporter.sendMail(mailOptions)
    
    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

export async function sendThankYouEmail(donor, donation) {
  try {
    const subject = `Thank you for your generous donation!`
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .amount { font-size: 24px; font-weight: bold; color: #059669; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Support!</h1>
          </div>
          <div class="content">
            <p>Dear ${donor.firstName},</p>
            
            <p>On behalf of everyone at our organization, thank you for your generous donation of <span class="amount">$${donation.amount.toLocaleString()}</span>.</p>
            
            <p>Your support makes a real difference in our work and helps us continue our mission. We are deeply grateful for your commitment to our cause.</p>
            
            <p>This donation will be used to support our programs and initiatives, making a tangible impact in the community.</p>
            
            <p>Thank you again for your generosity and support.</p>
            
            <p>With gratitude,</p>
            <p>The Team</p>
          </div>
          <div class="footer">
            <p>This is an automated receipt for your donation. Please keep this email for your records.</p>
            <p>If you have any questions, please contact us at support@organization.org</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await sendEmail({
      to: donor.email,
      subject,
      html,
    })
  } catch (error) {
    console.error('Failed to send thank you email:', error)
    throw error
  }
}

export async function sendMeetingReminder(communication) {
  try {
    const { donor, subject, sentAt } = communication
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Meeting Reminder</h1>
          </div>
          <div class="content">
            <p>Dear ${donor.firstName},</p>
            
            <p>This is a reminder about our upcoming meeting:</p>
            
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Scheduled:</strong> ${new Date(sentAt).toLocaleDateString()} at ${new Date(sentAt).toLocaleTimeString()}</p>
            
            <p>Please let me know if you need to reschedule or if you have any questions before our meeting.</p>
            
            <p>Looking forward to our conversation!</p>
            
            <p>Best regards,</p>
            <p>Your Organization Team</p>
          </div>
          <div class="footer">
            <p>This is an automated reminder. If you have any questions, please reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await sendEmail({
      to: donor.email,
      subject: `Reminder: ${subject}`,
      html,
    })
  } catch (error) {
    console.error('Failed to send meeting reminder:', error)
    throw error
  }
}

export async function sendWeeklyDigest(user, stats) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .stat-card { background-color: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
          .stat-label { font-size: 14px; color: #6b7280; }
          .upcoming { background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Weekly Donor Digest</h1>
            <p>Week of ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">$${stats.totalDonations.toLocaleString()}</div>
              <div class="stat-label">Total Donations</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.newDonors}</div>
              <div class="stat-label">New Donors</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.lybuntCount}</div>
              <div class="stat-label">LYBUNT Donors</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.upcomingMeetings}</div>
              <div class="stat-label">Upcoming Meetings</div>
            </div>
          </div>
          
          ${stats.upcomingFollowUps.length > 0 ? `
            <div class="upcoming">
              <h3>Follow-ups Needed</h3>
              <ul>
                ${stats.upcomingFollowUps.map(f => `<li>${f.donorName} - ${f.date}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <p>Best regards,<br>The DonorConnect Team</p>
        </div>
      </body>
      </html>
    `

    return await sendEmail({
      to: user.email,
      subject: 'Your Weekly Donor Digest',
      html,
    })
  } catch (error) {
    console.error('Failed to send weekly digest:', error)
    throw error
  }
}