import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import RootLayout from '../layout';
import { unstable_setRequestLocale } from 'next-intl/server';

export default async function LocaleLayout({ children, params: { locale } }:{ children: ReactNode, params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }
  return (
    <RootLayout>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </RootLayout>
  );
}
