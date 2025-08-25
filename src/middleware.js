import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value; // ou localStorage côté client

  const url = req.nextUrl.clone();

  // si pas de token → rediriger vers login
  if (!token && url.pathname.startsWith("/dashboard")) {
    url.pathname = "/connexion"; 
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], // protègera /dashboard et ses sous-routes
};
