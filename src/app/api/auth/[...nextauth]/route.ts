import bcrypt from "bcryptjs";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";
import {
  getPermissionPayload,
  USER_PERMISSION_KEYS,
  USER_PERMISSION_SELECT,
} from "@/lib/permissions";
import { normalizeEmail } from "@/lib/security";

function envFlag(name: string) {
  const value = process.env[name]?.trim().toLowerCase();

  if (value === "true") return true;
  if (value === "false") return false;

  return undefined;
}

const useSecureCookies =
  envFlag("NEXTAUTH_USE_SECURE_COOKIES") ??
  process.env.NEXTAUTH_URL?.startsWith("https://") ??
  false;

const nextAuthOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
    updateAge: 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },

      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email);
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        let user;

        try {
          user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              role: true,
            },
          });
        } catch (error) {
          console.error("Erro ao buscar usuario para login:", error);
          return null;
        }

        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: null,
          profileImageUrl: null,
          role: user.role,
          ...USER_PERMISSION_KEYS.reduce(
            (permissions, key) => ({ ...permissions, [key]: false }),
            {}
          ),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = Number(user.id);
        token.role = user.role;
        token.picture = user.profileImageUrl ?? user.image ?? null;
        Object.assign(token, getPermissionPayload(user));
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.image = typeof token.picture === "string" ? token.picture : null;
        session.user.profileImageUrl = session.user.image;
        Object.assign(session.user, getPermissionPayload(token));

        try {
          const user = await prisma.user.findUnique({
            where: { id: Number(token.id) },
            select: {
              role: true,
              profileImageUrl: true,
              ...USER_PERMISSION_SELECT,
            },
          });

          if (user) {
            session.user.role = user.role;
            session.user.image = user.profileImageUrl;
            session.user.profileImageUrl = user.profileImageUrl;
            Object.assign(session.user, getPermissionPayload(user));
          }
        } catch (error) {
          console.error("Erro ao atualizar dados da sessao:", error);

          const user = await prisma.user.findUnique({
            where: { id: Number(token.id) },
            select: {
              role: true,
            },
          });

          if (user) {
            session.user.role = user.role;
          }
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/SignIn",
    signOut: "/",
    error: "/SignIn",
  },
};
const handler = NextAuth(nextAuthOptions);

export { handler as GET, handler as POST, nextAuthOptions };
