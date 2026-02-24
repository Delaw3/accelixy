import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/user.model";

type SafeAuthUser = {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  emailVerified: Date | null;
  country: string;
  phone: string;
};

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
        }).select("+password");

        if (!user?.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        const safeUser: SafeAuthUser = {
          id: user._id.toString(),
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          email: user.email,
          emailVerified: null,
          country: user.country,
          phone: user.phone,
        };

        return safeUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user as SafeAuthUser;
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
