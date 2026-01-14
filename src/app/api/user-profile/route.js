import { auth } from "@/auth"
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            skills: user.skills,
            portfolioProjects: user.portfolioProjects
        });

    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
