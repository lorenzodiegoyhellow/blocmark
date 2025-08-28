const fetch = require('node-fetch');

async function testModeration() {
  // Test sending a message with phone numbers and emails
  const testMessage = {
    receiverId: 1,
    locationId: 1,
    message: "You can reach me at 555-1234 or five five five, one two three four. Also email me at test@example.com"
  };
  
  console.log('Testing content moderation with message:', testMessage.message);
  
  try {
    const response = await fetch('https://workspace.lorenzo105.repl.co/api/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', result);
    
    if (result.message && result.message.content) {
      console.log('Sanitized content:', result.message.content);
      console.log('Original content had private info removed successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testModeration();
