import {getRequestConfig} from 'next-intl/server';

export const locales = ['es', 'en'] as const;
export const defaultLocale = 'es';
export const localePrefix = 'as-needed';

export default getRequestConfig(async ({locale}) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}));
