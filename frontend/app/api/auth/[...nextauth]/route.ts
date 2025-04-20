import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

export const POST = NextAuth(authOptions);
export const GET = NextAuth(authOptions);