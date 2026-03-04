'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/mobile-news', label: 'Mobile News' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/comparison', label: 'VS' },
  { href: '/updates', label: 'Updates' },
  { href: '/buying-guide', label: 'Buying Guide' },
  { href: '/web-stories', label: '⚡ Stories' },
]

export default function Header() {
  const pathname = usePathname()
  const [menu, setMenu] = useState(false)
  const [date, setDate] = useState('')

  useEffect(() => {
    setDate(new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
  }, [])

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gray-900 text-gray-400 text-xs py-1.5 px-4 flex justify-between items-center">
        <span>{date}</span>
        <div className="flex gap-4">
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
        </div>
      </div>
      {/* Main nav */}
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 bg-red-700 rounded-full flex items-center justify-center text-white font-black text-sm">TTB</div>
          <div className="hidden sm:block">
            <div className="text-lg font-black text-gray-900 leading-none">The Tech Bharat</div>
            <div className="text-xs text-gray-500 font-medium">INDIA'S MOBILE AUTHORITY</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={`px-3 py-2 rounded-lg text-sm font-600 transition-all ${
                pathname === n.href ? 'bg-red-700 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}>
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Search + Mobile menu */}
        <div className="flex items-center gap-2">
          <Link href="/search" className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </Link>
          <button onClick={() => setMenu(!menu)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <div className="w-5 h-0.5 bg-gray-700 mb-1"></div>
            <div className="w-5 h-0.5 bg-gray-700 mb-1"></div>
            <div className="w-5 h-0.5 bg-gray-700"></div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menu && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} onClick={() => setMenu(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-semibold ${
                pathname === n.href ? 'bg-red-700 text-white' : 'text-gray-700'
              }`}>
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
