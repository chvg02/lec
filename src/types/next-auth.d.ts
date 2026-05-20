import { DefaultSession, DefaultUser } from "next-auth";
import type { UserPermissionFlags } from "@/lib/permissions";

declare module "next-auth" {
  interface User extends DefaultUser, Partial<UserPermissionFlags> {
    id: number;
    role: string;
    profileImageUrl?: string | null;
  }

  interface Session {
    user: {
      id: number;
      role: string;
      profileImageUrl?: string | null;
    } & DefaultSession["user"] & UserPermissionFlags;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends Partial<UserPermissionFlags> {
    id: number;
    role: string;
  }
}
