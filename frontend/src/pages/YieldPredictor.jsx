import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import PageWrapper from '../components/PageWrapper'
import { TrendingUp, Loader2, ChevronRight, BarChart3 } from 'lucide-react'

function InputField({ label, type = 'number', value, onChange, placeholder, min, max, step }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min} max={max} step={step}
        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder-gray-400 dark:placeholder-gray-600"
      />
    </div>
  )
}

export default function YieldPredictor() {
  const { t } = useApp()
  const [form, setForm] = useState({ rainfall: '', soil_quality: '', farm_size: '', sunlight_hours: '', fertilizer_used: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const setField = key => val => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (Object.values(form).some(v => !v)) { setError(t('fill_all')); return }
    setError(''); setResult(null); setLoading(true)
    try {
      const res = await fetch('/api/yield_prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rainfall: parseFloat(form.rainfall),
          soil_quality: parseFloat(form.soil_quality),
          farm_size: parseFloat(form.farm_size),
          sunlight_hours: parseFloat(form.sunlight_hours),
          fertilizer_used: parseFloat(form.fertilizer_used),
        })
      })
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      setResult(d)
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper bgUrl="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1920&q=80">
      <div className="w-full">

        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
            <TrendingUp size={13} /> AI Yield Intelligence
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-gray-900 dark:text-white tracking-tight mb-3">{t('yield_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">{t('yield_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <InputField label={t('yield_rainfall')} value={form.rainfall} onChange={setField('rainfall')} placeholder="e.g. 200" />
                <InputField label={t('yield_soil')} value={form.soil_quality} onChange={setField('soil_quality')} placeholder="e.g. 7" min="1" max="10" step="0.1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label={t('yield_size')} value={form.farm_size} onChange={setField('farm_size')} placeholder="e.g. 2.5" step="0.1" />
                <InputField label={t('yield_sunlight')} value={form.sunlight_hours} onChange={setField('sunlight_hours')} placeholder="e.g. 8" step="0.1" max="24" />
              </div>
              <InputField label={t('yield_fertilizer')} value={form.fertilizer_used} onChange={setField('fertilizer_used')} placeholder="e.g. 150" />

              {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl px-4 py-2.5">{error}</p>}

              <button
                type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> {t('loading')}</> : <>{t('yield_btn')} <ChevronRight size={18} /></>}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            {result ? (
              <>
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-8 text-white shadow-xl shadow-amber-500/30 animate-fadeInUp">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 size={18} className="text-amber-200" />
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-200">{t('yield_result')}</p>
                  </div>
                  <h2 className="font-display font-black text-5xl mb-1">
                    {typeof result.yield === 'number' ? result.yield.toFixed(2) : result.yield}
                  </h2>
                  <p className="text-sm text-amber-200 font-semibold">tonnes / hectare</p>
                  {result.interpretation && (
                    <div className="mt-5 pt-5 border-t border-amber-400/40">
                      <p className="text-sm text-amber-100 leading-relaxed">{result.interpretation}</p>
                    </div>
                  )}
                </div>

                {result.factors && (
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl p-6 shadow-sm animate-fadeInUp">
                    <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">Yield Factors</h3>
                    <div className="space-y-3">
                      {Object.entries(result.factors).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{k.replace(/_/g, ' ')}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700">
                              <div className="h-1.5 rounded-full bg-amber-500 transition-all duration-700" style={{ width: `${Math.min(100, v)}%` }} />
                            </div>
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 w-8 text-right">{v}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-4">
                  <TrendingUp size={28} className="text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Enter your farm parameters and predict expected yield with AI</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
