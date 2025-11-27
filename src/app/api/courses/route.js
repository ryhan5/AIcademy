import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import User from "@/models/User";

export async function GET(req) {
    try {
        console.log("API /api/courses: Starting...");
        const session = await auth();
        console.log("API /api/courses: Session:", session ? "Found" : "Null");

        if (!session || !session.user) {
            console.log("API /api/courses: Unauthorized");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        console.log("API /api/courses: DB Connected");

        let userId = session.user.id;
        console.log("API /api/courses: User ID from session:", userId);

        if (!userId) {
            console.log("API /api/courses: User ID missing, looking up by email:", session.user.email);
            const user = await User.findOne({ email: session.user.email });
            if (user) {
                userId = user._id;
                console.log("API /api/courses: User found by email:", userId);
            } else {
                console.log("API /api/courses: User not found by email");
            }
        }

        if (!userId) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const courses = await Course.find({ userId }).sort({ createdAt: -1 });
        console.log(`API /api/courses: Found ${courses.length} courses`);

        return NextResponse.json(courses);
    } catch (error) {
        console.error("Fetch Courses Error Stack:", error.stack);
        return NextResponse.json(
            { error: `Failed to fetch courses: ${error.message}` },
            { status: 500 }
        );
    }
}
