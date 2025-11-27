import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { answers, questions } = await req.json();

        // Simple evaluation logic (can be enhanced with AI later if needed for open-ended q's)
        let score = 0;
        const total = questions.length;
        const results = [];

        questions.forEach((q) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            if (isCorrect) score++;

            results.push({
                questionId: q.id,
                isCorrect,
                userAnswer,
                correctAnswer: q.correctAnswer
            });
        });

        const percentage = (score / total) * 100;
        let level = "Beginner";
        if (percentage > 80) level = "Advanced";
        else if (percentage > 40) level = "Intermediate";

        return NextResponse.json({
            score,
            total,
            percentage,
            level,
            results
        });
    } catch (error) {
        console.error("Evaluation Error:", error);
        return NextResponse.json(
            { error: "Failed to evaluate assessment" },
            { status: 500 }
        );
    }
}
