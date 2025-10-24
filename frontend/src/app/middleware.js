import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Kalau bukan akses dashboard → biarkan lewat
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Ambil token dari cookie
  const token = req.cookies.get("token");

  // Kalau token tidak ada → redirect ke login
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Terapkan hanya di /dashboard/*
export const config = {
  matcher: ["/dashboard/:path*"],
};
