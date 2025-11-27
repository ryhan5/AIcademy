import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { messages, context } = await req.json();
        const { role, stack, experience } = context;

        const systemPrompt = `
            You are an expert technical interviewer evaluating a candidate for a ${experience} ${role} position.
            The candidate's tech stack is: ${stack}.

            Analyze the following interview transcript and provide a detailed evaluation.
            
            Return ONLY a JSON object with the following structure (no markdown, no extra text):
            {
                "score": number (0-100),
                "feedback": "Overall summary of performance",
                "strengths": ["point 1", "point 2", ...],
                "weaknesses": ["point 1", "point 2", ...],
                "improvement_plan": ["step 1", "step 2", ...]
            }

            Be fair, constructive, and specific.
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
                temperature: 0.3,
                max_tokens: 1024,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Groq API Error Response:', errorData);
            throw new Error(`Groq API failed with status ${response.status}`);
        }

        const data = await response.json();
        const feedbackContent = data.choices[0]?.message?.content;

        let feedbackJson;
        try {
            feedbackJson = JSON.parse(feedbackContent);
        } catch (e) {
            console.error("Failed to parse JSON feedback:", e);
            feedbackJson = {
                score: 0,
                feedback: "Failed to generate structured feedback.",
                strengths: [],
                weaknesses: [],
                improvement_plan: []
            };
        }

        return NextResponse.json(feedbackJson);

    } catch (error) {
        console.error('Feedback API Error:', error);
        return NextResponse.json({ error: 'Failed to generate feedback' }, { status: 500 });
    }
}
