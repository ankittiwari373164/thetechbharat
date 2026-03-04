import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: { default: 'The Tech Bharat — India\'s Mobile Authority', template: '%s | The Tech Bharat' },
  description: 'Latest smartphone news, reviews, comparisons and buying guides for India. ₹ pricing, Indian perspective.',
  keywords: 'smartphone India, mobile reviews India, best phones India, tech news India',
  openGraph: {
    type: 'website', locale: 'en_IN', siteName: 'The Tech Bharat',
    url: 'https://thetechbharat.com',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
