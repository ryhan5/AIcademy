import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
    try {
        const { projectTitle, techStack, description } = await req.json();

        if (!projectTitle || !techStack) {
            return NextResponse.json({ error: 'Project Title and Tech Stack are required' }, { status: 400 });
        }

        const prompt = `
        You are a senior software architect and career mentor. Create a gamified, career-focused implementation blueprint for: "${projectTitle}".
        
        Context:
        - Description: ${description}
        - Tech Stack: ${techStack.join(', ')}
        
        Provide the response in the following strictly valid JSON structure (NO markdown, NO comments):
        {
          "missionBrief": "A roleplay scenario. E.g., 'You have been hired by a YC-backed Fintech startup to build their MVP...'",
          "overview": "Technical executive summary.",
          "features": ["Feature 1", "Feature 2"],
          "architecture": {
             "frontend": "Strategy...",
             "backend": "Strategy...",
             "database": "Schema..."
          },
          "resumeBullets": [
             "Action-oriented bullet point 1 (e.g., 'Engineered a real-time...')",
             "Action-oriented bullet point 2",
             "Action-oriented bullet point 3"
          ],
          "sprints": [
             { "phase": "Sprint 1: The Foundation", "tasks": ["Task 1", "Task 2"] },
             { "phase": "Sprint 2: Core Mechanics", "tasks": ["Task 1", "Task 2"] }
          ],
          "challenges": ["Challenge 1", "Challenge 2"]
        }
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a technical architect that outputs strictly JSON.' },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5,
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content;
        const data = JSON.parse(content);

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error generating blueprint:', error);
        return NextResponse.json({ error: 'Failed to generate blueprint' }, { status: 500 });
    }
}
