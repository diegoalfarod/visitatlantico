// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  // Si el host comienza con "en.", reescribimos la ruta a /en/<originalPath>
  if (host.startsWith('en.')) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${url.pathname}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Aplica a todas las rutas excepto API, _next, y archivos estáticos
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
