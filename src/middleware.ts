import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

export const runtime = "experimental-edge";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/dashboard/:path*", "/learn/:path*", "/settings", "/admin/:path*"],
};
