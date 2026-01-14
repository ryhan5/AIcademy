import { auth } from "@/auth"
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { topic } = await req.json();

        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // 1. Add to completed courses if strictly new
        const alreadyCompleted = user.completedCourses.includes(topic);
        if (!alreadyCompleted) {
            user.completedCourses.push(topic);
        }

        // 2. Determine Skill Impact
        // Simple keyword matching for now
        let subject = 'Frontend'; // default
        const lowerTopic = topic.toLowerCase();

        if (lowerTopic.includes('backend') || lowerTopic.includes('node') || lowerTopic.includes('database') || lowerTopic.includes('api')) subject = 'Backend';
        if (lowerTopic.includes('design') || lowerTopic.includes('ui') || lowerTopic.includes('ux') || lowerTopic.includes('css')) subject = 'Design';
        if (lowerTopic.includes('ai') || lowerTopic.includes('machine learning') || lowerTopic.includes('gpt')) subject = 'AI/ML';
        if (lowerTopic.includes('mobile') || lowerTopic.includes('react native') || lowerTopic.includes('ios')) subject = 'Mobile';
        if (lowerTopic.includes('devops') || lowerTopic.includes('docker') || lowerTopic.includes('aws')) subject = 'DevOps';

        // 3. Boost Skill
        let skillIndex = user.skills.findIndex(s => s.subject === subject);
        if (skillIndex === -1) {
            user.skills.push({ subject, score: 0 });
            skillIndex = user.skills.length - 1;
        }

        // Boost score by 10-20 points
        const boost = Math.floor(Math.random() * 10) + 10;
        user.skills[skillIndex].score = Math.min(150, user.skills[skillIndex].score + boost);

        // 4. Unlock Portfolio Project (Simulation)
        // If skill score > 80 and no project for this skill, add one
        const hasProjectForSkill = user.portfolioProjects.some(p => p.tags.includes(subject));
        let newProject = null;

        if (user.skills[skillIndex].score > 80 && !hasProjectForSkill) {
            newProject = {
                title: `${subject} Mastery Project`,
                desc: `An advanced ${subject} application demonstrating core competencies in ${topic}.`,
                tags: [subject, topic.split(' ')[0]],
                color: subject === 'Frontend' ? 'from-purple-500 to-pink-500' :
                    subject === 'Backend' ? 'from-blue-500 to-cyan-500' :
                        subject === 'AI/ML' ? 'from-emerald-500 to-teal-500' : 'from-orange-500 to-red-500'
            };
            user.portfolioProjects.push(newProject);
        }

        await user.save();

        return NextResponse.json({
            success: true,
            skillUpdate: { subject, boost },
            newProject
        });

    } catch (error) {
        console.error("Completion error:", error);
        return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
    }
}
