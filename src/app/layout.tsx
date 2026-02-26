import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Wandermark - Your world, marked.',
  description:
    'Track every country you have visited, share your journey, discover where friends have been.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-slate-900 text-white`}
      >
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
