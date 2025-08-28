import postmark from 'postmark';

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

async function sendTestEmail() {
  try {
    console.log('Sending test email with verified sender...');
    
    const result = await client.sendEmail({
      From: 'lorenzodiego2@gmail.com',  // Your verified sender
      To: 'lorenzodiego2@gmail.com',     // Sending to yourself
      Subject: 'Blocmark Email System Test - Success!',
      TextBody: 'Congratulations! Your Blocmark email system is working correctly. This is a test email from your platform.',
      HtmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">✅ Email System Working!</h2>
          <p>Congratulations! Your Blocmark email system is now fully operational.</p>
          <p>This test confirms that:</p>
          <ul>
            <li>✓ Postmark API is connected</li>
            <li>✓ Sender verification is complete</li>
            <li>✓ Emails can be delivered successfully</li>
          </ul>
          <p style="color: #666;">You can now send welcome emails, booking confirmations, and other notifications from your platform.</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">Sent from Blocmark via Postmark</p>
        </div>
      `,
      MessageStream: 'outbound'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.MessageID);
    console.log('Check your inbox - the email should arrive within seconds.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.ErrorCode) {
      console.error('Postmark Error Code:', error.ErrorCode);
    }
  }
}

sendTestEmail();
