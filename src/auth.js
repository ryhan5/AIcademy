import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import authConfig from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                await dbConnect();

                const user = await User.findOne({ email: credentials.email }).select("+password");

                if (!user) {
                    throw new Error("Invalid credentials");
                }

                // If user signed up with Google, they might not have a password
                if (!user.password) {
                    throw new Error("Please login with Google");
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordCorrect) {
                    throw new Error("Invalid credentials");
                }

                return user;
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account, profile }) {
            // Allow OAuth providers to sign in without DB check (handled by provider)
            // But we want to sync/create user in DB
            if (account?.provider === "google") {
                try {
                    await dbConnect();
                    const existingUser = await User.findOne({ email: user.email });
                    if (!existingUser) {
                        // Create new user for Google login
                        await User.create({
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            isVerified: false, // Default
                        });
                    }
                } catch (error) {
                    console.error("Error in Google SignIn callback:", error);
                    return false; // Return false to display Access Denied
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            // Initial sign in
            if (account && user) {
                // If user has _id (Credentials), use it
                if (user._id) {
                    token.sub = user._id.toString();
                }
            }

            // For Google/OAuth, or subsequent calls, ensure we have the DB ID
            // If token.sub is not a valid ObjectId (likely Google ID is numeric), fetch from DB
            // Simple check: MongoDB ObjectIds are 24 hex chars. Google IDs are usually numeric strings.
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(token.sub);

            if (!isObjectId && token.email) {
                try {
                    await dbConnect();
                    const dbUser = await User.findOne({ email: token.email });
                    if (dbUser) {
                        token.sub = dbUser._id.toString();
                    }
                } catch (error) {
                    console.error("Error in JWT callback:", error);
                }
            }

            return token;
        },
    },
});
