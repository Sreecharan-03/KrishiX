import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import PageWrapper from '../components/PageWrapper'
import { Sparkles, Loader2, ChevronRight, MapPin, Lightbulb } from 'lucide-react'

const CROP_TYPES = ['Barley', 'Coffee', 'Cotton', 'Ground Nuts', 'Jowar', 'Kidneybeans', 'Lentil',
  'Maize', 'Millets', 'Oil seeds', 'Paddy', 'Pulses', 'Sugarcane', 'Tobacco', 'Watermelon', 'Wheat']
const SOIL_TYPES = ['Black', 'Clayey', 'Loamy', 'Red', 'Sandy']

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
        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-lime-500/30 focus:border-lime-500 transition-all placeholder-gray-400 dark:placeholder-gray-600"
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-lime-500/30 focus:border-lime-500 transition-all"
      >
        <option value="">Select…</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export default function FertilizerPredictor() {
  const { t } = useApp()
  const [form, setForm] = useState({ N: '', P: '', K: '', temperature: '', humidity: '', crop_type: '', soil_type: '', city: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const setField = key => val => setForm(f => ({ ...f, [key]: val }))

  const fetchWeather = async () => {
    if (!form.city.trim()) return
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(form.city)}`)
      const d = await res.json()
      if (d.temperature !== undefined) setForm(f => ({ ...f, temperature: d.temperature, humidity: d.humidity }))
    } catch { /* silent */ }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const required = ['N', 'P', 'K', 'temperature', 'humidity', 'crop_type', 'soil_type']
    if (required.some(k => !form[k])) { setError(t('fill_all')); return }
    setError(''); setResult(null); setLoading(true)
    try {
      const res = await fetch('/api/fertilizer_prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          N: parseFloat(form.N), P: parseFloat(form.P), K: parseFloat(form.K),
          temperature: parseFloat(form.temperature), humidity: parseFloat(form.humidity),
          crop_type: form.crop_type, soil_type: form.soil_type,
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
    <PageWrapper bgUrl="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1920&q=80">
      <div className="w-full">

        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles size={13} /> AI Fertilizer Advisor
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-gray-900 dark:text-white tracking-tight mb-3">{t('fert_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">{t('fert_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Soil Nutrients</h3>
                <div className="grid grid-cols-3 gap-4">
                  <InputField label={t('fert_n')} value={form.N} onChange={setField('N')} placeholder="e.g. 37" min="0" max="140" />
                  <InputField label={t('fert_p')} value={form.P} onChange={setField('P')} placeholder="e.g. 0" min="0" max="145" />
                  <InputField label={t('fert_k')} value={form.K} onChange={setField('K')} placeholder="e.g. 0" min="0" max="205" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField label={t('fert_crop')} value={form.crop_type} onChange={setField('crop_type')} options={CROP_TYPES} />
                <SelectField label={t('fert_soil')} value={form.soil_type} onChange={setField('soil_type')} options={SOIL_TYPES} />
              </div>

              <div>
                <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Weather</h3>
                <div className="flex gap-3 mb-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">{t('fert_city')}</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      placeholder="e.g. Pune"
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:ring-2 focus:ring-lime-500/30 focus:border-lime-500 transition-all text-gray-800 dark:text-gray-200"
                    />
                  </div>
                  <div className="flex items-end">
                    <button type="button" onClick={fetchWeather}
                      className="px-4 py-3 rounded-xl border border-lime-300 dark:border-lime-700 bg-lime-50 dark:bg-lime-900/40 text-lime-700 dark:text-lime-400 text-sm font-semibold hover:bg-lime-100 dark:hover:bg-lime-900/60 transition-colors flex items-center gap-1.5">
                      <MapPin size={14} /> Auto-fill
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label={t('fert_temp')} value={form.temperature} onChange={setField('temperature')} placeholder="e.g. 26" step="0.1" />
                  <InputField label={t('fert_humidity')} value={form.humidity} onChange={setField('humidity')} placeholder="e.g. 52" step="0.1" />
                </div>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl px-4 py-2.5">{error}</p>}

              <button
                type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-lime-500 to-emerald-600 text-white font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-lime-500/30 hover:shadow-lime-500/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> {t('loading')}</> : <>{t('fert_btn')} <ChevronRight size={18} /></>}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            {result ? (
              <>
                <div className="bg-gradient-to-br from-lime-500 to-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-lime-500/30 animate-fadeInUp">
                  <p className="text-xs font-bold uppercase tracking-widest text-lime-200 mb-2">{t('fert_result_title')}</p>
                  <h2 className="font-display font-black text-3xl">{result.fertilizer}</h2>
                  {result.npk_advice && (
                    <p className="mt-4 text-sm text-lime-100 leading-relaxed">{result.npk_advice}</p>
                  )}
                </div>
                {result.tips?.length > 0 && (
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl p-6 shadow-sm animate-fadeInUp">
                    <h3 className="flex items-center gap-2 font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                      <Lightbulb size={16} className="text-amber-500" /> {t('fert_tips')}
                    </h3>
                    <ul className="space-y-2">
                      {result.tips.map((tip, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-lime-500 mt-0.5">•</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                <div className="w-16 h-16 rounded-3xl bg-lime-100 dark:bg-lime-900/40 flex items-center justify-center mb-4">
                  <Sparkles size={28} className="text-lime-600 dark:text-lime-400" />
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Fill the form and submit to see your fertilizer recommendation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
