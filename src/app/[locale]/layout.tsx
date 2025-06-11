import { NextIntlClientProvider } from 'next-intl';

import { notFound } from 'next/navigation';
import RootLayout from '../layout';
import { setRequestLocale } from 'next-intl/server';

export default async function LocaleLayout(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { children, params: { locale } }: any
) {
  setRequestLocale(locale);
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }
  return (
    <RootLayout locale={locale}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </RootLayout>
  );
}
