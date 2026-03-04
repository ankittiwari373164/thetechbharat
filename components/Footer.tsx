import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-red-700 rounded-full flex items-center justify-center text-white font-black text-sm">TTB</div>
            <div>
              <div className="font-black text-white">The Tech Bharat</div>
              <div className="text-xs text-gray-500">INDIA'S MOBILE AUTHORITY</div>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">India's most trusted source for smartphone news, honest reviews, and buying guides. ₹ pricing, Indian perspective.</p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Content</h4>
          <ul className="space-y-2 text-sm">
            {[['Mobile News','/mobile-news'],['Reviews','/reviews'],['VS Comparisons','/comparison'],['Updates','/updates'],['Buying Guide','/buying-guide'],['Web Stories','/web-stories']].map(([l,h]) => (
              <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Brands</h4>
          <ul className="space-y-2 text-sm">
            {['Samsung','Apple','OnePlus','Realme','Google','Xiaomi'].map(b => (
              <li key={b}><Link href={`/mobile-news?brand=${b}`} className="hover:text-white transition-colors">{b}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
          <ul className="space-y-2 text-sm">
            {[['About Us','/about'],['Contact','/contact'],['Privacy Policy','/privacy'],['Advertise','/advertise']].map(([l,h]) => (
              <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} The Tech Bharat. All rights reserved.
      </div>
    </footer>
  )
}
