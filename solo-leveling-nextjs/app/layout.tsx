import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Solo Leveling Fitness',
  description: 'Level up in real life - fitness RPG tracker',
  manifest: '/manifest.json',
  themeColor: '#050510',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Solo Leveling Fitness',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
