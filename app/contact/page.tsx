export const metadata = { title: 'Contact Us' }
export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-4xl font-black mb-6">Contact Us</h1>
      <p className="text-gray-600 mb-8">Have a tip, feedback, or want to advertise? Get in touch.</p>
      <div className="bg-white rounded-2xl shadow-sm p-8 space-y-4">
        <div><label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
          <input className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-red-400 outline-none" placeholder="Your name"/></div>
        <div><label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
          <input type="email" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-red-400 outline-none" placeholder="you@example.com"/></div>
        <div><label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
          <textarea rows={5} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-red-400 outline-none resize-none" placeholder="Your message…"/></div>
        <button className="w-full bg-red-700 text-white rounded-xl py-3 font-bold hover:bg-red-800 transition-colors">Send Message</button>
      </div>
      <div className="mt-8 text-center text-sm text-gray-500">
        Or email us at: <a href="mailto:hello@thetechbharat.com" className="text-red-600 font-semibold">hello@thetechbharat.com</a>
      </div>
    </div>
  )
}
