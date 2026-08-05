import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Admin credentials from environment variables
// Multiple admin users supported: ADMIN_EMAILS and ADMIN_PASSWORDS (comma-separated)
const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);
const adminPasswords = (process.env.ADMIN_PASSWORDS || "").split(",").filter(Boolean);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) return null;

        // Check against env-configured admin users
        const index = adminEmails.indexOf(email);
        if (index !== -1 && adminPasswords[index] === password) {
          return {
            id: email,
            email,
            name: "Admin",
            role: "admin",
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role || "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
