import { prisma } from "@/lib/prisma";
import { ensureAuthEnv, getAuthBaseUrl } from "@/lib/auth-url";
import { isAdminEmail } from "@/lib/admin-email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { UserRole } from "@/generated/prisma/client";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

ensureAuthEnv();

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
  providers.push(
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
  },
  debug: process.env.NEXTAUTH_DEBUG === "true",
  events: {
    async signIn({ user }) {
      console.info("[auth] signed in:", user.email ?? user.id);

      const userEmail = user.email?.trim().toLowerCase();

      if (user.id && (await isAdminEmail(userEmail))) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          });
        } catch (error) {
          console.error("[auth] failed to promote admin user:", error);
        }
      }
    },
    createUser({ user }) {
      console.info("[auth] created user:", user.email ?? user.id);
    },
    linkAccount({ user, account }) {
      console.info("[auth] linked account:", user.email, account.provider);
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        const userEmail = user.email?.trim().toLowerCase();

        if (await isAdminEmail(userEmail)) {
          token.role = "ADMIN";
        } else {
          token.role = (user as { role?: UserRole }).role ?? "CUSTOMER";
        }
      }

      if (token.sub && !token.role) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true },
          });
          token.role = dbUser?.role ?? "CUSTOMER";
        } catch (error) {
          console.error("[auth] failed to load user role:", error);
          token.role = "CUSTOMER";
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as UserRole | undefined) ?? "CUSTOMER";
      }

      return session;
    },
    redirect({ url }) {
      const canonicalBase = getAuthBaseUrl();

      if (url.startsWith("/")) {
        return `${canonicalBase}${url}`;
      }

      try {
        const target = new URL(url);
        const allowed = new URL(canonicalBase);

        if (target.origin === allowed.origin) {
          return url;
        }
      } catch {
        return canonicalBase;
      }

      return canonicalBase;
    },
  },
};

export type AuthJwt = JWT & {
  role?: UserRole;
};
