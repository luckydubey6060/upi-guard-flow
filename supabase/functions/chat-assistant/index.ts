import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { message, context = '' } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Received chat request:', { message, context });

    // Create system prompt with context about the UPI Fraud Detection Dashboard
    const systemPrompt = `You are an AI support assistant for the UPI Fraud Detection Dashboard. You help users understand and use the fraud detection system. 

Key features of the dashboard:
- Upload CSV datasets with transaction data
- Train ML models using TensorFlow.js for fraud detection
- Make predictions on individual transactions
- Real-time transaction monitoring and streaming
- Analytics with charts showing fraud patterns
- Export reports as PDF/CSV
- Dark/light mode themes
- Alerts and notifications system

Data format should include: TransactionID, UserID, Amount, Timestamp, Location, DeviceID, TransactionType, FraudLabel

Be helpful, concise, and focus on the UPI fraud detection context. If the user asks about specific highlighted text, provide relevant explanations about that feature.

${context ? `User context: "${context}"` : ''}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_completion_tokens: 500,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const assistantMessage = data.choices[0].message.content;
    console.log('Generated response:', assistantMessage);

    return new Response(JSON.stringify({ 
      message: assistantMessage,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});