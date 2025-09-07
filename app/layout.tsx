import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'where are you going?',
  description: 'An ethereal interactive art chatbot experience',
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
