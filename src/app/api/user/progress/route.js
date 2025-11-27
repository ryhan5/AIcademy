import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        await dbConnect();

        // Update user progress fields
        // We only update specific fields to avoid overwriting sensitive data
        const updateFields = {
            xp: data.xp,
            level: data.level,
            streak: data.streak,
            lastLoginDate: data.lastLoginDate,
            completedModules: data.completedModules,
            completedRoadmaps: data.completedRoadmaps,
            achievements: data.achievements,
            isVerified: data.isVerified,
        };

        await User.findByIdAndUpdate(session.user.id, updateFields);

        return NextResponse.json({ message: "Progress synced" }, { status: 200 });
    } catch (error) {
        console.error("Sync error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Return the progress data structure
        const progress = {
            userId: user._id,
            xp: user.xp,
            level: user.level,
            streak: user.streak,
            lastLoginDate: user.lastLoginDate,
            completedModules: user.completedModules,
            completedRoadmaps: user.completedRoadmaps,
            achievements: user.achievements,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
        };

        return NextResponse.json(progress, { status: 200 });
    } catch (error) {
        console.error("Fetch error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
