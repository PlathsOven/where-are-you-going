import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'where are you going?',
  description: 'Hey...you look lost.',
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
