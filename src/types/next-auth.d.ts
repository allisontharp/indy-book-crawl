import "next-auth"
import { Role } from "@/types"

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: Role;
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
  }

  interface Session {
    user: User & {
      role: Role;
    };
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
  }
}