import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { messages, context } = await req.json();
        const { role, stack, experience } = context;

        const systemPrompt = `
            You are an expert technical interviewer conducting a mock interview for a ${experience} ${role} position. 
            The candidate's tech stack is: ${stack}.
            
            Your goal is to assess their technical knowledge, problem-solving skills, and communication.
            
            Rules:
            1. ACT LIKE A REAL PERSON ON A VOICE CALL. Use natural, conversational language.
            2. Start by introducing yourself warmly and asking the first question.
            3. Ask ONE question at a time. Do not overwhelm the candidate.
            4. After the candidate answers, provide IMMEDIATE, BRIEF feedback (1-2 sentences) on their answer. Correct them if wrong, praise them if right.
            5. Then, transition smoothly to the next question.
            6. Keep your responses SHORT (under 100 words) so they are easy to listen to via Text-to-Speech.
            7. Mix theoretical questions, scenario-based questions, and code snippet analysis (if applicable).
            
            Interviewer (You):
        `;

        // Convert messages to Groq format
        const conversationHistory = messages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
        }));

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...conversationHistory
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_tokens: 1024,
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Groq API Error Response:', errorData);
            throw new Error(`Groq API failed with status ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const reply = data.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";

        return NextResponse.json({ reply });

    } catch (error) {
        console.error('Interview API Error Detailed:', error);
        return NextResponse.json({ error: 'Failed to generate response', details: error.message }, { status: 500 });
    }
}
