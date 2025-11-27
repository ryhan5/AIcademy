export default {
    providers: [],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async session({ session, token }) {
            if (token?.sub) {
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user._id;
            }
            return token;
        },
    },
    session: {
        strategy: "jwt",
    },
};
