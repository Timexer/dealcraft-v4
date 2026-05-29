import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/", // We use the main page as the sign-in page
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        if (user.accessTier === "LOCKED") {
          // You could optionally throw an error here, but typically you let them log in
          // and show the lock screen in the UI so they can see their options to upgrade.
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          accessTier: user.accessTier,
        };
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.accessTier = token.accessTier as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessTier = user.accessTier;
      } else if (token.id) {
        // Refresh token data from DB if available (so access tier changes take effect)
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { accessTier: true }
        });
        if (dbUser) {
          token.accessTier = dbUser.accessTier;
        }
      }
      return token;
    },
  },
};
