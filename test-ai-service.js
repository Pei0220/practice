// Simple test to verify AI service functionality
const { AIService } = require('./lib/backend/services/ai.service.ts');

async function testChatAPI() {
  try {
    console.log('Testing AI Service...');
    
    const testMessage = {
      content: "What's the current CPI trend?",
      sender: "user",
      timestamp: new Date()
    };

    const response = await AIService.processChat(testMessage, []);
    
    console.log('✅ AI Service Test Successful');
    console.log('Response:', response.message.content);
    console.log('Suggested Actions:', response.suggestedActions);
    
  } catch (error) {
    console.error('❌ AI Service Test Failed:', error.message);
  }
}

testChatAPI();
