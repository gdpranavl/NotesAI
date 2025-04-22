// src/app/api/summarize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { content } = await req.json();
    
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Create prompt for summarization
    const prompt = `Summarize the following text in a concise paragraph:\n\n${content}\n\nProvide only the summary paragraph without any introductory words or explanations.`;
    
    // Generate summary
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      { error: 'Failed to summarize content' },
      { status: 500 }
    );
  }
}
