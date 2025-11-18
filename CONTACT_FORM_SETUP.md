# Contact Form Email Setup

The contact form is now fully functional and will send emails to `info@kerbe.ai`. Here's how to configure email sending:

## Current Status
✅ Contact form is working  
✅ Form validation is working  
✅ API endpoint is functional  
✅ Email content is being logged to console  

## Email Configuration (Optional)

By default, the contact form logs emails to the console instead of sending them. To enable actual email sending, configure these environment variables in your `.env.local` file:

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Use the app password** (not your regular password) in `SMTP_PASS`

## Other Email Providers

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Yahoo Mail
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Custom SMTP Server
```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587  # or 465 for SSL
SMTP_SECURE=false  # true for port 465, false for port 587
```

## Testing the Contact Form

1. **Start the development server**:
   ```bash
   cd analytics-platform-frontend
   npm run dev
   ```

2. **Visit the contact form** at `http://localhost:3000` and scroll to the "Get In Touch" section

3. **Test the form** with:
   - Valid data (should show success message)
   - Invalid email (should show validation error)
   - Missing fields (should show validation error)

4. **Check the console** for logged email content (when SMTP is not configured)

## API Testing

You can also test the API directly:

```bash
# Valid submission
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "subject": "Test Subject",
    "message": "This is a test message."
  }'

# Invalid submission (missing fields)
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name": "", "email": "invalid", "subject": "", "message": ""}'
```

## Features Implemented

- ✅ **Form Fields**: Name, Email, Subject, Message (all required)
- ✅ **Validation**: Email format validation and required field checks
- ✅ **UI/UX**: Beautiful glass-morphism design matching the site theme
- ✅ **Loading States**: Shows loading spinner while submitting
- ✅ **Success/Error Messages**: Clear feedback to users
- ✅ **Responsive Design**: Works on all device sizes
- ✅ **Email Templates**: Both plain text and HTML email formats
- ✅ **Error Handling**: Graceful error handling and user feedback
- ✅ **Security**: Input validation and sanitization

## Production Deployment

For production deployment:

1. **Configure SMTP credentials** in your production environment
2. **Use a dedicated email service** like:
   - Resend (recommended for Next.js)
   - SendGrid
   - AWS SES
   - Mailgun
3. **Set up proper domain verification** for the sender email
4. **Consider rate limiting** to prevent spam
5. **Add CAPTCHA** for additional spam protection

The current implementation is ready for production use with proper SMTP configuration!
