import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
    try {
        const { skills } = await req.json();

        if (!skills) {
            return NextResponse.json({ error: 'Skills/Topics are required' }, { status: 400 });
        }

        const prompt = `
        You are an expert tech career mentor. The user has been learning: "${skills}".
        
        Generate 3 distinct side project ideas that are NOT generic to-do lists or weather apps.
        The projects should bridge the gap between learning and building, helping the user create a portfolio-worthy application.
        
        1. **Beginner**: A manageable project to solidify basics.
        2. **Intermediate**: A project that introduces complexity (API, Auth, or State Management).
        3. **Advanced**: A "Deep Work" project that solves a real problem or mocks a complex system.
        
        Return ONLY valid JSON in the following structure, with no markdown formatting:
        {
          "projects": [
            {
              "title": "Project Title",
              "description": "2-3 sentence inspiring description.",
              "techStack": ["Tech 1", "Tech 2"],
              "difficulty": "Beginner | Intermediate | Advanced",
              "learningOutcomes": ["Outcome 1", "Outcome 2"]
            }
          ]
        }
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a helpful coding mentor that outputs strictly JSON.' },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content;
        const data = JSON.parse(content);

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error generating projects:', error);
        return NextResponse.json({ error: 'Failed to generate projects' }, { status: 500 });
    }
}
