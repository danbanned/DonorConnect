// /api/communications/email/route.js
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
const EmailTemplates = {
  welcome: ({ firstName }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333;">Welcome, ${firstName}!</h1>
      <p>Thank you for joining our community.</p>
    </div>
  `,
  newsletter: ({ firstName }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333;">Our Latest Newsletter</h1>
      <p>Hi ${firstName}, here's what's new this week...</p>
    </div>
  `,
  promotion: ({ firstName }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333;">Special Offer Just for You!</h1>
      <p>Hi ${firstName}, enjoy 20% off your next purchase.</p>
    </div>
  `,
  custom: ({ html }) => html // Custom HTML template
};


export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      to, 
      subject, 
      template, 
      variables,
      html, // custom HTML content
      from = process.env.DEFAULT_FROM_EMAIL || 'Acme <onboarding@resend.dev>'
    } = body;

    // Validate required fields
    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject' },
        { status: 400 }
      );
    }

    let emailHtml;

    if (template === 'custom' && html) {
      emailHtml = html;

    } else if (template) {
      // Use predefined template
      const templateFn = EmailTemplates[template];
      if (!templateFn) {
        return NextResponse.json(
          { error: `Template "${template}" not found` },
          { status: 400 }
        );
      }
      emailHtml = templateFn(variables || {});
    } else {
      return NextResponse.json(
        { error: 'Either template or html must be provided' },
        { status: 400 }
      );
    }

     // Prepare email data
    const emailData = {
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: emailHtml,
    };

     // Add CC if provided
    if (cc && cc.trim()) {
      emailData.cc = Array.isArray(cc) ? cc : [cc];
    }

    // Add BCC if provided
    if (bcc && bcc.trim()) {
      emailData.bcc = Array.isArray(bcc) ? bcc : [bcc];
    }


    // Send email
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: emailHtml,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Email sent successfully!' 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}