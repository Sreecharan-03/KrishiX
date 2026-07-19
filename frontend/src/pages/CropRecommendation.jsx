import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import PageWrapper from '../components/PageWrapper'
import { Sprout, Loader2, ChevronRight, MapPin } from 'lucide-react'
import { cropPredict, getWeather } from '../utils/api'

const CROP_TYPES = ['Rice', 'Wheat', 'Maize', 'Chickpea', 'Kidneybeans', 'Pigeonpeas', 'Mothbeans',
  'Mungbean', 'Blackgram', 'Lentil', 'Pomegranate', 'Banana', 'Mango', 'Grapes', 'Watermelon',
  'Muskmelon', 'Apple', 'Orange', 'Papaya', 'Coconut', 'Cotton', 'Jute', 'Coffee']

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
        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder-gray-400 dark:placeholder-gray-600"
      />
    </div>
  )
}

export default function CropRecommendation() {
  const { t } = useApp()
  const [form, setForm] = useState({ N: '', P: '', K: '', temperature: '', humidity: '', ph: '', rainfall: '', city: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const setField = key => val => setForm(f => ({ ...f, [key]: val }))

  const fetchWeather = async () => {
    if (!form.city.trim()) return
    try {
      const d = await getWeather(form.city)
      const data = d.data
      if (data?.temperature !== undefined) {
        setForm(f => ({ ...f, temperature: data.temperature, humidity: data.humidity }))
      }
    } catch { /* silent */ }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const required = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    if (required.some(k => !form[k])) { setError(t('fill_all')); return }
    setError(''); setResult(null); setLoading(true)
    try {
      const d = await cropPredict({
        N: parseFloat(form.N), P: parseFloat(form.P), K: parseFloat(form.K),
        temperature: parseFloat(form.temperature), humidity: parseFloat(form.humidity),
        ph: parseFloat(form.ph), rainfall: parseFloat(form.rainfall),
      })
      const data = d.data
      if (data?.error) throw new Error(data.error)
      setResult(data)
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper bgUrl="https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1920&q=80">
      <div className="w-full">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Sprout size={13} /> AI Crop Intelligence
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-gray-900 dark:text-white tracking-tight mb-3">{t('crop_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">{t('crop_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Form card */}
          <div className="lg:col-span-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Soil NPK */}
              <div>
                <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Soil Parameters</h3>
                <div className="grid grid-cols-3 gap-4">
                  <InputField label={t('crop_n')} value={form.N} onChange={setField('N')} placeholder="e.g. 90" min="0" max="140" />
                  <InputField label={t('crop_p')} value={form.P} onChange={setField('P')} placeholder="e.g. 42" min="5" max="145" />
                  <InputField label={t('crop_k')} value={form.K} onChange={setField('K')} placeholder="e.g. 43" min="5" max="205" />
                </div>
              </div>

              {/* pH + Rainfall */}
              <div className="grid grid-cols-2 gap-4">
                <InputField label={t('crop_ph')} value={form.ph} onChange={setField('ph')} placeholder="e.g. 6.5" step="0.1" min="3" max="10" />
                <InputField label={t('crop_rainfall')} value={form.rainfall} onChange={setField('rainfall')} placeholder="e.g. 202 mm" min="20" max="300" />
              </div>

              {/* Weather */}
              <div>
                <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Weather</h3>
                <div className="flex gap-3 mb-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">{t('crop_city')}</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      placeholder="e.g. Hyderabad"
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder-gray-400 dark:placeholder-gray-600"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={fetchWeather}
                      className="px-4 py-3 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-sm font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-1.5"
                    >
                      <MapPin size={14} /> Auto-fill
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label={t('crop_temp')} value={form.temperature} onChange={setField('temperature')} placeholder="e.g. 28" step="0.1" min="-10" max="50" />
                  <InputField label={t('crop_humidity')} value={form.humidity} onChange={setField('humidity')} placeholder="e.g. 80" step="0.1" min="14" max="100" />
                </div>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl px-4 py-2.5">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> {t('loading')}</> : <>{t('crop_btn')} <ChevronRight size={18} /></>}
              </button>
            </form>
          </div>

          {/* Result card */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {result ? (
              <>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/30 animate-fadeInUp">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-2">{t('crop_result_title')}</p>
                  <h2 className="font-display font-black text-4xl capitalize mb-1">{result.crop}</h2>
                  {result.confidence && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-emerald-200 mb-1">
                        <span>Confidence</span><span>{result.confidence}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-emerald-800/50">
                        <div className="h-2 rounded-full bg-white/80 transition-all duration-700" style={{ width: `${result.confidence}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {result.top5 && (
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl p-6 shadow-sm animate-fadeInUp">
                    <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">{t('crop_top5')}</h3>
                    <ul className="space-y-3">
                      {result.top5.map((c, i) => (
                        <li key={i} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize">{c.crop}</span>
                          </div>
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{c.confidence}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4">
                  <Sprout size={28} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Fill in the form and hit <strong className="text-gray-600 dark:text-gray-300">Recommend Crops</strong> to see AI suggestions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
