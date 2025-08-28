import postmark from 'postmark';

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

async function sendTestEmail() {
  try {
    console.log('Attempting to send test email from Gmail address...');
    
    const result = await client.sendEmail({
      From: 'lorenzodiego2@gmail.com',  // Using your Gmail as sender
      To: 'lorenzodiego2@gmail.com',     // Sending to same Gmail
      Subject: 'Test Email from Blocmark',
      TextBody: 'This is a test email to verify Postmark is working.',
      HtmlBody: '<strong>This is a test email</strong> to verify Postmark is working.',
      MessageStream: 'outbound'
    });
    
    console.log('Email sent successfully!');
    console.log('Message ID:', result.MessageID);
    console.log('Submitted At:', result.SubmittedAt);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

sendTestEmail();
