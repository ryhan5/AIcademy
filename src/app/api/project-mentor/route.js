import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
    try {
        const { message, history, context } = await req.json();
        const { projectTitle, mission, techStack } = context;

        const systemPrompt = `
        You are a Senior Tech Lead and Mentor helping a junior developer build their project: "${projectTitle}".
        
        Project Context:
        - Mission: "${mission}"
        - Tech Stack: ${techStack?.join(', ')}
        
        Your Role:
        - Guide them through implementation specific to THEIR project.
        - If they ask "How do I do task X?", give specific code examples or architectural advice using the defined tech stack.
        - Be encouraging but technically rigorous.
        - Keep answers concise and actionable.
        
        Current conversation history is provided.
        `;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: message }
        ];

        const completion = await groq.chat.completions.create({
            messages: messages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 1024,
        });

        const reply = completion.choices[0]?.message?.content;

        return NextResponse.json({ reply });

    } catch (error) {
        console.error('Error in project mentor chat:', error);
        return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
    }
}
