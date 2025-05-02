import './globals.css'
import { Poppins, Merriweather_Sans } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
})

const merriweatherSans = Merriweather_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-merriweather-sans',
})

export const metadata = {
  title: 'VisitAtlántico',
  description: 'Explora el paraíso costero del Atlántico, Colombia.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${poppins.variable} ${merriweatherSans.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
