import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import PageWrapper from '../components/PageWrapper'
import {
  Sprout, ShieldAlert, Sparkles, TrendingUp, Calendar,
  ArrowRight, Search, Landmark, Globe, ChevronRight
} from 'lucide-react'

const SERVICES = [
  {
    id: 'crop', path: '/crop', key: 'service_crop',
    icon: Sprout,
    gradient: 'from-emerald-500 to-teal-600',
    img: '/images/crop.jpg',
  },
  {
    id: 'fertilizer', path: '/fertilizer', key: 'service_fert',
    icon: Sparkles,
    gradient: 'from-lime-500 to-emerald-600',
    img: '/images/fertilizer.webp',
  },
  {
    id: 'disease', path: '/disease', key: 'service_disease',
    icon: ShieldAlert,
    gradient: 'from-rose-500 to-orange-500',
    img: '/images/disease.webp',
  },
  {
    id: 'yield', path: '/yield', key: 'service_yield',
    icon: TrendingUp,
    gradient: 'from-amber-500 to-orange-600',
    img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'prices', path: '/prices', key: 'service_prices',
    icon: Landmark,
    gradient: 'from-blue-500 to-indigo-600',
    img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 'calendar', path: '/calendar', key: 'service_calendar',
    icon: Calendar,
    gradient: 'from-violet-500 to-purple-600',
    img: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
  },
]

const STATS = [
  { value: '15+', key: 'home_stat1', color: 'text-emerald-500' },
  { value: '38+', key: 'home_stat2', color: 'text-rose-500' },
  { value: '10K+', key: 'home_stat3', color: 'text-amber-500' },
  { value: '28', key: 'home_stat4', color: 'text-blue-500' },
]

const FEATURES = [
  { key: 'feat1', icon: Globe, color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' },
  { key: 'feat2', icon: Sparkles, color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400' },
  { key: 'feat3', icon: TrendingUp, color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
  { key: 'feat4', icon: Sprout, color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
]

export default function Home() {
  const { t } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = SERVICES.filter(s =>
    t(`${s.key}_title`).toLowerCase().includes(search.toLowerCase()) ||
    t(`${s.key}_desc`).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageWrapper bgUrl="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80">
      <div className="space-y-16">

        {/* ── Hero ── */}
        <section className="relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={12} /> AI-Powered Precision Agriculture
            </div>
            <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-gray-900 dark:text-white leading-[1.05] tracking-tight mb-6">
              {t('home_hero_title')}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-10 max-w-2xl">
              {t('home_hero_subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#services"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all duration-200"
              >
                {t('home_hero_btn1')} <ArrowRight size={18} />
              </a>
              <button
                onClick={() => navigate('/prices')}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur text-gray-800 dark:text-white font-bold text-base border border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Landmark size={18} /> {t('home_hero_btn2')}
              </button>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`text-4xl font-black font-display ${s.color} mb-1`}>{s.value}</div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t(s.key)}</div>
            </div>
          ))}
        </section>

        {/* ── Services ── */}
        <section id="services">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
                {t('home_services_title')}
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-900 dark:text-white tracking-tight">{t('home_services_subtitle')}</h2>
            </div>
            {/* Search */}
            <div className="relative flex-shrink-0 w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search services…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(svc => {
              const Icon = svc.icon
              return (
                <div
                  key={svc.id}
                  className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(svc.path)}
                >
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={svc.img}
                      alt={t(`${svc.key}_title`)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className={`absolute bottom-4 left-4 w-11 h-11 rounded-2xl bg-gradient-to-br ${svc.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon size={22} className="text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-2">{t(`${svc.key}_title`)}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">{t(`${svc.key}_desc`)}</p>
                    <button
                      className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${svc.gradient} text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
                    >
                      {t(`${svc.key}_btn`)} <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Features ── */}
        <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl p-10 shadow-sm">
          <h2 className="font-display font-black text-3xl text-gray-900 dark:text-white text-center mb-10">{t('home_features_title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => {
              const Icon = f.icon
              return (
                <div key={f.key} className="flex flex-col gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">{t(`${f.key}_title`)}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t(`${f.key}_desc`)}</p>
                </div>
              )
            })}
          </div>
        </section>

      </div>
    </PageWrapper>
  )
}
