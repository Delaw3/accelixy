import { DefaultSession } from "next-auth";

type AppUser = {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  emailVerified: Date | null;
  country: string;
  phone: string;
};

declare module "next-auth" {
  interface User {
    id: string;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    emailVerified: Date | null;
    country: string;
    phone: string;
  }

  interface Session {
    user: AppUser & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: AppUser;
  }
}
