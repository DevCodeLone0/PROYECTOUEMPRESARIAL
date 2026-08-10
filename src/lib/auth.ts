import crypto from "crypto";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Admin credentials from environment variables
// Multiple admin users supported: ADMIN_EMAILS and ADMIN_PASSWORDS (comma-separated)
const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);
const adminPasswords = (process.env.ADMIN_PASSWORDS || "").split(",").filter(Boolean);

// Brute-force protection: max 10 failed attempts per identifier per 15 minutes
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;
const failedAttempts = new Map<string, { count: number; firstAt: number }>();

function cleanExpired(): void {
  const now = Date.now();
  for (const [key, entry] of failedAttempts) {
    if (now - entry.firstAt > WINDOW_MS) {
      failedAttempts.delete(key);
    }
  }
}

function isThrottled(identifier: string): boolean {
  cleanExpired();
  const entry = failedAttempts.get(identifier);
  return entry ? entry.count >= MAX_ATTEMPTS : false;
}

function recordFailure(identifier: string): void {
  const now = Date.now();
  const entry = failedAttempts.get(identifier);
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    failedAttempts.set(identifier, { count: 1, firstAt: now });
  } else {
    entry.count += 1;
  }
}

/**
 * Constant-time password comparison: both values are hashed with SHA-256
 * to equalize lengths, then compared with timingSafeEqual.
 */
function secureEqual(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a, "utf8").digest();
  const hashB = crypto.createHash("sha256").update(b, "utf8").digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

class ThrottledSigninError extends CredentialsSignin {
  constructor() {
    super();
    this.code = "throttled";
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
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

        if (isThrottled(email)) {
          throw new ThrottledSigninError();
        }

        // Check against env-configured admin users
        const index = adminEmails.indexOf(email);
        if (index !== -1 && secureEqual(password, adminPasswords[index] ?? "")) {
          failedAttempts.delete(email);
          return {
            id: email,
            email,
            name: "Admin",
            role: "admin",
          };
        }

        recordFailure(email);
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
