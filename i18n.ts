export const locales = ['en', 'es'] as const;
export const defaultLocale = 'es';

export default function getRequestConfig() {
  return {
    locales,
    defaultLocale,
  } as const;
}
