import type { NextAuthConfig } from "next-auth";

// Edge-safe base config: no Prisma / bcrypt imports here, so this file can
// be pulled into `middleware.ts` (which runs on the Edge runtime) without
// bundling Node-only dependencies. The Credentials provider itself — which
// does need Prisma — is added on top of this in `lib/auth.ts`, which only
// ever runs in the Node.js runtime (API routes, Server Actions, RSC).
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: typeof token.role }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
