import { NextRequest, NextResponse } from "next/server";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Prepare email content
    const emailContent = `
New Contact Form Submission from KERBÉ AI Website

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This message was sent from the KERBÉ AI contact form.
Time: ${new Date().toISOString()}
    `.trim();

    // Send email using a simple email service
    // For production, you might want to use a service like SendGrid, Resend, or Nodemailer
    const emailResponse = await sendEmail({
      to: "info@kerbe.ai",
      from: "noreply@kerbe.ai", // This should be a verified domain
      subject: `Contact Form: ${subject}`,
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This message was sent from the KERBÉ AI contact form.<br>
            Time: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    if (!emailResponse.success) {
      console.error("Email sending failed:", emailResponse.error);
      return NextResponse.json(
        { message: "Failed to send email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Message sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { message: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

// Email sending function using Nodemailer
async function sendEmail({
  to,
  from,
  subject,
  text,
  html,
}: {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}) {
  try {
    // Check if we have email configuration
    const emailConfig = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    // If no SMTP credentials are configured, log the email instead
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.log("=== EMAIL WOULD BE SENT (No SMTP configured) ===");
      console.log("To:", to);
      console.log("From:", from);
      console.log("Subject:", subject);
      console.log("Text:", text);
      console.log("HTML:", html);
      console.log("================================================");
      console.log("To enable actual email sending, configure SMTP environment variables:");
      console.log("- SMTP_HOST (e.g., smtp.gmail.com)");
      console.log("- SMTP_PORT (e.g., 587)");
      console.log("- SMTP_SECURE (true for 465, false for 587)");
      console.log("- SMTP_USER (your email)");
      console.log("- SMTP_PASS (your app password)");
      console.log("================================================");
      return { success: true };
    }

    // Use Nodemailer for actual email sending
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransporter(emailConfig);

    const mailOptions = {
      from: from,
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
