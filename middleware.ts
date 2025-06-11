import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale, localePrefix} from './src/i18n';
import type {NextRequest} from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  getLocale: (request: NextRequest) => {
    const host = request.headers.get('host') || '';
    if (host.startsWith('en.')) return 'en';
    if (host.startsWith('es.')) return 'es';
    return undefined;
  }
});

export default intlMiddleware;

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)']
};
