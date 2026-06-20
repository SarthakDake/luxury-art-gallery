import { authOptions } from "@/lib/auth";
import { ensureAuthEnv } from "@/lib/auth-url";
import NextAuth from "next-auth";

ensureAuthEnv();

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
