import { auth } from '@/auth';
import { i18n } from '@/i18n/config';
import { NextRequest, NextResponse } from 'next/server';

function getLocale(request: NextRequest): string {
  // Check for locale in cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && i18n.locales.includes(cookieLocale as typeof i18n.locales[number])) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].trim().substring(0, 2))
      .find((lang) => i18n.locales.includes(lang as typeof i18n.locales[number]));

    if (preferredLocale) {
      return preferredLocale;
    }
  }

  return i18n.defaultLocale;
}

// Protected routes that require authentication
const protectedPaths = ['/dashboard'];

function isProtectedRoute(pathname: string): boolean {
  return protectedPaths.some((path) => pathname.includes(path));
}

export const proxy = auth((request) => {
  const { pathname } = request.nextUrl;

  // Check if pathname already has a locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Get or determine locale
  let locale: string = i18n.defaultLocale;
  if (pathnameHasLocale) {
    locale = pathname.split('/')[1];
  } else {
    locale = getLocale(request);
  }

  // Check if trying to access protected route without auth
  if (isProtectedRoute(pathname) && !request.auth) {
    const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If no locale in path, redirect to locale-prefixed path
  if (!pathnameHasLocale) {
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, static files)
    '/((?!_next|api|favicon.ico|.*\\..*).*)',
  ],
};
