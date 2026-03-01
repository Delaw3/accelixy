import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/user.model";
import { capitalizeFirstLetter } from "@/lib/utils";

type SafeAuthUser = {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  emailVerified: Date | null;
  role: "USER" | "ADMIN";
  country: string;
  phone: string;
};

function normalizeRole(role: unknown): "USER" | "ADMIN" {
  const value = String(role ?? "").trim().toUpperCase();
  return value === "ADMIN" ? "ADMIN" : "USER";
}

class AccountDeactivatedError extends CredentialsSignin {
  code = "account_deactivated";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.JWT_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = String(credentials?.identifier ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!identifier || !password) {
          return null;
        }

        await connectDB();

        const user = await User.findOne({
          $or: [{ email: identifier }, { username: identifier }],
        }).select("+password role isActive");

        if (!user?.password) {
          return null;
        }

        if (user.isActive === false) {
          throw new AccountDeactivatedError();
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        const safeUser: SafeAuthUser = {
          id: user._id.toString(),
          firstname: capitalizeFirstLetter(user.firstname),
          lastname: capitalizeFirstLetter(user.lastname),
          username: user.username,
          email: user.email,
          emailVerified: null,
          role: normalizeRole(user.role),
          country: user.country,
          phone: user.phone,
        };

        return safeUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.user = user as SafeAuthUser;
      }

      if (trigger === "update" && session?.user && token.user) {
        const nextUser = session.user as Partial<SafeAuthUser>;
        token.user = {
          ...(token.user as SafeAuthUser),
          firstname: nextUser.firstname ?? (token.user as SafeAuthUser).firstname,
          lastname: nextUser.lastname ?? (token.user as SafeAuthUser).lastname,
          username: nextUser.username ?? (token.user as SafeAuthUser).username,
          role: normalizeRole(nextUser.role ?? (token.user as SafeAuthUser).role),
          country: nextUser.country ?? (token.user as SafeAuthUser).country,
          phone: nextUser.phone ?? (token.user as SafeAuthUser).phone,
        };
      }

      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as SafeAuthUser;
      }

      return session;
    },
  },
});
