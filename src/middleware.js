import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value; // ou localStorage côté client

  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // si pas de token → rediriger vers login
  if (!token && pathname.startsWith("/dasboard")) {
    url.pathname = "/connexion"; 
    return NextResponse.redirect(url);
  }

  // si authentifié → empêcher l'accès à /connexion et à la page d'accueil
  if (token && (pathname === "/" || pathname === "/connexion")) {
    url.pathname = "/dasboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dasboard/:path*", // protéger l'espace privé quand non connecté
    "/",                // rediriger vers /dasboard si déjà connecté
    "/connexion",       // empêcher d'aller sur la page login si déjà connecté
  ],
};
