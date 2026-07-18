import React from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Heart } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-[90%] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4 group w-fit">
              <img src="/images/logo.png" alt="krishiX" className="w-8 h-8 object-contain" />
              <span className="font-extrabold text-lg text-gray-900 dark:text-white font-display">krishiX</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              AI-powered precision agriculture platform helping Indian farmers make smarter decisions — from soil analysis to market prices.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">Tools</h4>
            <ul className="space-y-2">
              {[
                { to: '/crop', label: 'Crop Recommendation' },
                { to: '/fertilizer', label: 'Fertilizer Advisor' },
                { to: '/disease', label: 'Disease Detector' },
                { to: '/yield', label: 'Yield Predictor' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">Resources</h4>
            <ul className="space-y-2">
              {[
                { to: '/prices', label: 'Mandi Prices' },
                { to: '/calendar', label: 'Crop Calendar' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-400 dark:text-gray-500">© {year} krishiX. Built for India's farmers.</p>
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            Made with <Heart size={12} className="text-red-400 fill-red-400 mx-1" /> for Indian Agriculture
          </div>
        </div>
      </div>
    </footer>
  )
}
