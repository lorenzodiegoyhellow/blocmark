import postmark from 'postmark';

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

async function sendTestEmail() {
  try {
    console.log('Attempting to send test email...');
    console.log('Using API key:', process.env.POSTMARK_API_KEY ? 'Present' : 'Missing');
    
    const result = await client.sendEmail({
      From: 'hello@blocmark.com',
      To: 'lorenzodiego2@gmail.com',
      Subject: 'Test Email from Blocmark',
      TextBody: 'This is a test email to verify Postmark is working.',
      HtmlBody: '<strong>This is a test email</strong> to verify Postmark is working.',
      MessageStream: 'outbound'
    });
    
    console.log('Email sent successfully!');
    console.log('Message ID:', result.MessageID);
    console.log('Submitted At:', result.SubmittedAt);
    console.log('To:', result.To);
  } catch (error) {
    console.error('Error sending email:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    if (error.ErrorCode) {
      console.error('Postmark Error Code:', error.ErrorCode);
    }
    if (error.Message) {
      console.error('Postmark Message:', error.Message);
    }
  }
}

sendTestEmail();
