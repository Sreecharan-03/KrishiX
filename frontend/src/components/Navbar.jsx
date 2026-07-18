import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Sun, Moon, Globe, Menu, X, Leaf } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/', key: 'nav_home' },
  { path: '/crop', key: 'nav_crop' },
  { path: '/fertilizer', key: 'nav_fertilizer' },
  { path: '/disease', key: 'nav_disease' },
  { path: '/yield', key: 'nav_yield' },
  { path: '/prices', key: 'nav_prices' },
  { path: '/calendar', key: 'nav_calendar' },
]

export default function Navbar() {
  const { theme, toggleTheme, lang, setLang, t } = useApp()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl shadow-sm border-b border-emerald-100/50 dark:border-emerald-900/30'
        : 'bg-transparent'
      }`} style={{ height: '72px' }}>
      <div className="max-w-[90%] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

        {/* Brand */}
        <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-1.5 group select-none">
          {/* Logo with circular glow */}
          <div className="relative flex-shrink-0 w-11 h-11">
            {/* ambient glow blob */}
            <span className="absolute inset-0 rounded-full bg-emerald-400/30 blur-[10px] scale-125 opacity-60 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500" />
            {/* ring */}
            <span className="absolute inset-[-3px] rounded-full border border-emerald-500/30 group-hover:border-emerald-500/70 transition-all duration-300" />
            <img
              src="/images/logo.png"
              alt="KrishiX"
              className="relative w-11 h-11 object-contain rounded-xl drop-shadow-md group-hover:scale-110 transition-transform duration-300"
            />
          </div>


          <span className="text-[1.55rem] font-black tracking-tight leading-none text-gray-900 dark:text-white">
            Krishi<span className="text-emerald-500 dark:text-emerald-400">X</span>
          </span>
        </Link>



        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${active
                    ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                {t(item.key)}
              </Link>
            )
          })}
        </div>

        {/* Controls */}
        <div className="hidden lg:flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-gray-700">
          {/* Language */}
          <div className="flex items-center gap-1.5">
            <Globe size={14} className="text-gray-400" />
            <select
              value={lang}
              onChange={e => setLang(e.target.value)}
              className="bg-transparent border-none text-sm font-semibold text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="hi">हिन्दी</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:text-emerald-600 dark:hover:text-emerald-400 text-gray-600 dark:text-gray-300 transition-all duration-200"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-all"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden absolute top-[72px] inset-x-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-xl animate-fadeInUp">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {NAV_ITEMS.map(item => {
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active
                      ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  {t(item.key)}
                </Link>
              )
            })}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 mt-2">
              <div className="flex items-center gap-1.5">
                <Globe size={14} className="text-gray-400" />
                <select
                  value={lang}
                  onChange={e => { setLang(e.target.value); setOpen(false) }}
                  className="bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-300 outline-none cursor-pointer border-none"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                  <option value="te">తెలుగు</option>
                </select>
              </div>
              <button
                onClick={() => { toggleTheme(); setOpen(false) }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-all"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
