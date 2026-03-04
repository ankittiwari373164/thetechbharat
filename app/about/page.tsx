export const metadata = { title: 'About Us', description: 'About The Tech Bharat — India\'s mobile authority' }
export default function About() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-4xl font-black mb-6">About The Tech Bharat</h1>
      <div className="prose max-w-none text-gray-700 space-y-4">
        <p className="text-lg">The Tech Bharat is India's most trusted source for smartphone news, honest reviews, and buying guides.</p>
        <p>We cover every major smartphone launch in India — with real ₹ pricing, honest opinions, and advice that actually helps Indian buyers make better decisions.</p>
        <h2 className="text-2xl font-black text-gray-900 mt-8">Our Mission</h2>
        <p>To give Indian consumers the most accurate, unbiased, and useful smartphone information — in plain English, with Indian prices, for Indian conditions.</p>
        <h2 className="text-2xl font-black text-gray-900 mt-8">What We Cover</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Latest smartphone launches and leaks</li>
          <li>In-depth long-term reviews</li>
          <li>Head-to-head comparisons</li>
          <li>Software update news</li>
          <li>Best-buy guides for every budget</li>
        </ul>
      </div>
    </div>
  )
}
