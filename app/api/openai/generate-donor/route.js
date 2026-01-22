// app/api/openai/generate-donor/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or "gpt-4" if available
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates realistic fake donor data for nonprofit organizations. Always return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const generatedData = JSON.parse(completion.choices[0].message.content);
    
    // Validate and sanitize the generated data
    const validatedData = validateDonorData(generatedData);
    
    return NextResponse.json({
      success: true,
      data: validatedData
    });
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      fallback: true
    }, { status: 500 });
  }
}

function validateDonorData(data) {
  // Ensure all required fields exist
  const defaultData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    interests: [],
    preferredCommunication: 'email',
    notes: '',
    tags: []
  };

  // Merge with defaults
  const validated = { ...defaultData, ...data };

  // Ensure arrays are actually arrays
  if (!Array.isArray(validated.interests)) {
    validated.interests = [];
  }
  if (!Array.isArray(validated.tags)) {
    validated.tags = [];
  }

  // Sanitize strings
  Object.keys(validated).forEach(key => {
    if (typeof validated[key] === 'string') {
      validated[key] = validated[key].trim();
    }
  });

  return validated;
}