import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Decodifica un JWT y retorna el payload (o null si falla)
function decodeJwt(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Normaliza un rol a formato sin acentos y minúsculas (compatible con Edge Runtime)
function normalizeRole(role: string | undefined | null): string {
  if (!role) return '';
  return role
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Retorna la ruta base permitida para el rol
function getBasePathForRole(role: string | undefined | null): string {
  const r = normalizeRole(role);
  if (r === 'funcionario') return '/funcionario';
  if (r === 'administrador' || r === 'admin') return '/admin';
  // Por defecto, sector estratégico o desconocido va a ciudadano
  return '/ciudadano';
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  const roleCookieRaw = request.cookies.get('auth_role')?.value || null;
  const roleCookie = roleCookieRaw ? decodeURIComponent(roleCookieRaw) : null;
  
  const { pathname } = request.nextUrl;
  const roleFromToken = token ? decodeJwt(token)?.role : null;
  const roleNorm = normalizeRole(roleFromToken ?? roleCookie);
  const base = getBasePathForRole(roleNorm);

  // Debug en desarrollo: verificar evaluación de rol y ruta
  console.log('[MW]', {
    path: pathname,
    hasToken: Boolean(token),
    roleFromToken,
    roleCookie,
    roleNorm,
    base,
  });

  // Si usuario autenticado intenta acceder a /auth/*, redirigir a su home
  if (pathname.startsWith('/auth')) {
    if (token) {
      return NextResponse.redirect(new URL(base, request.url));
    }
    return NextResponse.next();
  }

  // Si el usuario está autenticado y entra a la raíz, enviarlo a su home
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL(base, request.url));
    }
    return NextResponse.next();
  }

  // Rutas protegidas por rol (aplicar de forma explícita por prefijo)
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!(roleNorm === 'administrador' || roleNorm === 'admin')) {
      return NextResponse.redirect(new URL(base, request.url));
    }
  }

  if (pathname.startsWith('/funcionario')) {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (roleNorm !== 'funcionario') {
      return NextResponse.redirect(new URL(base, request.url));
    }
  }

  if (pathname.startsWith('/ciudadano')) {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (roleNorm !== 'sector estrategico') {
      return NextResponse.redirect(new URL(base, request.url));
    }
  }

  console.log('[MW] Request pasó por middleware sin redirección:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/funcionario/:path*',
    '/ciudadano/:path*',
    '/auth/:path*',
  ],
};