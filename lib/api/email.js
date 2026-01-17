import nodemailer from 'nodemailer'

// Create transporter for Resend SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.SMTP_USER || 'resend',
    pass: process.env.SMTP_PASSWORD || '',
  },
})

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email server connection failed:', error)
  } else {
    console.log('✅ Email server is ready to send messages')
  }
})

export async function sendEmail({ to, subject, html, text, cc, bcc }) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'DonorConnect <no-reply@resend.dev>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
      cc,
      bcc,
    }

    const info = await transporter.sendMail(mailOptions)
    
    console.log('📧 Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Failed to send email:', error)
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
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #374151; 
            margin: 0; 
            padding: 0; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 0 20px; 
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 20px; 
            text-align: center; 
            border-radius: 0 0 20px 20px;
          }
          .content { 
            padding: 30px 20px; 
            background-color: #ffffff; 
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #6b7280; 
            font-size: 14px; 
            border-top: 1px solid #e5e7eb;
          }
          .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 14px 28px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            margin: 20px 0; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .features { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin: 30px 0; 
          }
          .feature { 
            text-align: center; 
            padding: 20px; 
            background: #f9fafb; 
            border-radius: 10px; 
          }
          .feature-icon { 
            font-size: 24px; 
            margin-bottom: 10px; 
          }
          .trial-badge { 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
            color: white; 
            padding: 6px 12px; 
            border-radius: 20px; 
            font-size: 14px; 
            font-weight: 600; 
            display: inline-block; 
            margin: 10px 0; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 32px;">Welcome to DonorConnect! 🎉</h1>
            <p style="font-size: 18px; opacity: 0.9; margin-top: 10px;">Your nonprofit fundraising management platform</p>
          </div>
          
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            
            <p>We're thrilled to welcome you and <strong>${organizationName}</strong> to DonorConnect! Your account has been successfully created and you're now ready to streamline your fundraising efforts.</p>
            
            <div class="trial-badge">✨ 30-DAY FREE TRIAL ACTIVATED ✨</div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" class="button">Launch Your Dashboard</a>
            </div>
            
            <div class="features">
              <div class="feature">
                <div class="feature-icon">👥</div>
                <h3 style="margin: 10px 0;">Donor Management</h3>
                <p style="font-size: 14px;">Track relationships, communications, and giving history</p>
              </div>
              <div class="feature">
                <div class="feature-icon">💰</div>
                <h3 style="margin: 10px 0;">Donation Tracking</h3>
                <p style="font-size: 14px;">Monitor contributions, generate reports, and forecast revenue</p>
              </div>
              <div class="feature">
                <div class="feature-icon">📧</div>
                <h3 style="margin: 10px 0;">Communication Tools</h3>
                <p style="font-size: 14px;">Send personalized emails and track engagement</p>
              </div>
              <div class="feature">
                <div class="feature-icon">📊</div>
                <h3 style="margin: 10px 0;">Insights & Analytics</h3>
                <p style="font-size: 14px;">Get actionable insights to grow your fundraising</p>
              </div>
            </div>
            
            <h3>Getting Started:</h3>
            <ol style="line-height: 2;">
              <li><strong>Complete your profile</strong> - Add your organization details</li>
              <li><strong>Import or add your first donors</strong> - Start building your database</li>
              <li><strong>Invite team members</strong> - Collaborate with your staff</li>
              <li><strong>Explore features</strong> - Try out all tools during your trial</li>
            </ol>
            
            <p>Need help getting started? Check out our <a href="${process.env.NEXTAUTH_URL}/guides">Getting Started Guide</a> or reach out to our support team.</p>
            
            <p>Best regards,<br>
            <strong>The DonorConnect Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This email was sent to ${to} because you registered for DonorConnect.</p>
            <p>If you didn't create this account, please <a href="${process.env.NEXTAUTH_URL}/support">contact support</a> immediately.</p>
            <p>© ${new Date().getFullYear()} DonorConnect. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await sendEmail({
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error)
    throw error
  }
}

export async function sendAdminNotification({ type, organizationName, userEmail, userCount }) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@donorconnect.app'
    const subject = `📊 New Organization Registered: ${organizationName}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 25px; background-color: #f9fafb; border: 1px solid #e5e7eb; }
          .info-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #4f46e5; }
          .label { color: #6b7280; font-size: 14px; margin-bottom: 5px; }
          .value { font-size: 16px; font-weight: 500; }
          .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat { text-align: center; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">🎯 New Organization Registration</h2>
          </div>
          
          <div class="content">
            <p>A new organization has registered on DonorConnect:</p>
            
            <div class="info-box">
              <div class="label">Organization Name</div>
              <div class="value">${organizationName}</div>
            </div>
            
            <div class="stats">
              <div class="stat">
                <div style="font-size: 24px; color: #4f46e5; font-weight: bold;">1</div>
                <div style="font-size: 14px; color: #6b7280;">Admin User</div>
              </div>
              <div class="stat">
                <div style="font-size: 24px; color: #10b981; font-weight: bold;">0</div>
                <div style="font-size: 14px; color: #6b7280;">Initial Donors</div>
              </div>
            </div>
            
            <div class="info-box">
              <div class="label">Admin Email</div>
              <div class="value">${userEmail}</div>
            </div>
            
            <div class="info-box">
              <div class="label">Registration Type</div>
              <div class="value">${type}</div>
            </div>
            
            <div class="info-box">
              <div class="label">Registration Time</div>
              <div class="value">${new Date().toLocaleString()}</div>
            </div>
            
            <p><strong>Action Items:</strong></p>
            <ul style="background: white; padding: 15px; border-radius: 6px;">
              <li>Add to CRM for follow-up</li>
              <li>Schedule welcome call in 3 days</li>
              <li>Monitor initial setup activity</li>
            </ul>
            
            <p>This notification was automatically generated by the DonorConnect registration system.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await sendEmail({
      to: adminEmail,
      subject,
      html,
    })
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error)
    throw error
  }
}

// Keep your existing email functions for compatibility
export async function sendThankYouEmail(donor, donation) {
  // ... existing code ...
}

export async function sendMeetingReminder(communication) {
  // ... existing code ...
}

export async function sendWeeklyDigest(user, stats) {
  // ... existing code ...
}