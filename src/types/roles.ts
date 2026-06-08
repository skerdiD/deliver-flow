export type UserRole = "admin" | "client";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};