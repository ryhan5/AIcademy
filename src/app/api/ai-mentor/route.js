import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
    try {
        const { message, history, context, image } = await req.json();

        // Construct the system prompt based on the "Universal AI Mentor" persona
        const systemPrompt = `You are an expert, patient, and interactive AI Teacher/Mentor. 
Your goal is to help the student understand the topic: "${context.topic}" (Chapter: "${context.chapterTitle}").

Your instructions:
1. **Explain the Meaning/Purpose:** Tell the student *what* a concept is and *why* it's important.
2. **Analyze Errors:** If the student makes a mistake or shares code with errors, explain *exactly* what the error means, why it occurred, and suggest the fix.
3. **Maintain a Teacher's Tone:** Be encouraging, clear, and conversational. Ask follow-up questions to ensure understanding.
4. **Be Concise:** Keep explanations clear and to the point, but detailed enough to be helpful.
5. **Universal Mentor:** You can teach ANY subject (Coding, History, Science, etc.). Adapt your explanations to the subject matter.
6. **Vision Capabilities:** If an image is provided, analyze it in detail. Explain diagrams, code screenshots, or UI elements visible in the image.

Current Context:
Topic: ${context.topic}
Chapter: ${context.chapterTitle}
Video Context: ${context.videoTitle || 'No video context'}
`;

        // Prepare messages for Groq
        let messages;
        let model = 'llama-3.3-70b-versatile';

        if (image) {
            // Vision Request
            model = 'meta-llama/llama-4-scout-17b-16e-instruct';
            messages = [
                { role: 'system', content: systemPrompt },
                ...history.map(msg => ({ role: msg.role, content: msg.content })),
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: message || "Analyze this image and explain what you see in the context of our lesson." },
                        { type: 'image_url', image_url: { url: image } }
                    ]
                }
            ];
        } else {
            // Text-only Request
            messages = [
                { role: 'system', content: systemPrompt },
                ...history.map(msg => ({ role: msg.role, content: msg.content })),
                { role: 'user', content: message }
            ];
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: model,
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            stream: false,
            stop: null
        });

        const reply = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

        return NextResponse.json({ reply });

    } catch (error) {
        console.error('Error in AI Mentor API:', error);
        if (error.response) {
            console.error('Groq API Error Data:', JSON.stringify(error.response.data, null, 2));
            console.error('Groq API Status:', error.response.status);
        } else if (error.message) {
            console.error('Error Message:', error.message);
        }
        return NextResponse.json(
            { error: 'Failed to process request', details: error.message },
            { status: 500 }
        );
    }
}
