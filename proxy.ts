import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isLocale, locales } from "@/i18n/config";

const LOCALE_COOKIE = "MENU_SYRIA_LOCALE";

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  for (const part of acceptLanguage.split(",")) {
    const lang = part.split(";")[0]!.trim().toLowerCase().split("-")[0]!;
    if (isLocale(lang)) return lang;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameLocale = locales.find(
    (locale) =>
      pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (pathnameLocale) {
    // Remember the visitor's explicit choice for future visits
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, pathnameLocale, {
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next internals, API routes and static files (anything with a dot)
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
