import React, { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import PageWrapper from '../components/PageWrapper'
import { ShieldAlert, Upload, Loader2, X, ImagePlus, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function DiseaseDetector() {
  const { t } = useApp()
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [drag, setDrag] = useState(false)
  const fileRef = useRef()

  const handleFile = file => {
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError('')
  }

  const handleDrop = e => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }

  const handleSubmit = async () => {
    if (!image) { setError('Please upload a leaf image.'); return }
    setError(''); setResult(null); setLoading(true)
    const fd = new FormData()
    fd.append('file', image)
    try {
      const res = await fetch('/api/disease_prediction', { method: 'POST', body: fd })
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      setResult(d)
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  const isHealthy = result && result.disease?.toLowerCase().includes('healthy')
  const confidence = result?.confidence ? Math.round(parseFloat(result.confidence)) : null

  return (
    <PageWrapper bgUrl="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1920&q=80">
      <div className="w-full">

        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-bold uppercase tracking-widest mb-4">
            <ShieldAlert size={13} /> AI Disease Detection
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-gray-900 dark:text-white tracking-tight mb-3">{t('disease_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">{t('disease_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Upload */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl p-8 shadow-sm">
            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden ${
                drag
                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/30'
                  : 'border-gray-300 dark:border-gray-700 hover:border-rose-400 hover:bg-rose-50/30 dark:hover:bg-rose-950/20'
              }`}
              style={{ minHeight: preview ? 'auto' : '220px' }}
            >
              {preview ? (
                <div className="relative group">
                  <img src={preview} alt="leaf" className="w-full rounded-xl object-cover max-h-64" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <ImagePlus size={32} className="text-white" />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                    <Upload size={26} className="text-rose-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{t('disease_upload')}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />

            {preview && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { setPreview(null); setImage(null); setResult(null) }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2 transition-colors"
                >
                  <X size={15} /> Remove
                </button>
                <button
                  onClick={handleSubmit} disabled={loading}
                  className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all"
                >
                  {loading ? <><Loader2 size={15} className="animate-spin" /> {t('loading')}</> : <>{t('disease_btn')}</>}
                </button>
              </div>
            )}

            {!preview && (
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-sm shadow-lg shadow-rose-500/30 hover:-translate-y-0.5 transition-all"
              >
                {t('disease_btn')}
              </button>
            )}

            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl px-4 py-2.5 mt-4">{error}</p>}
          </div>

          {/* Result */}
          <div className="flex flex-col gap-4">
            {result ? (
              <>
                <div className={`rounded-3xl p-8 text-white shadow-xl animate-fadeInUp ${
                  isHealthy
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30'
                    : 'bg-gradient-to-br from-rose-500 to-orange-600 shadow-rose-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-4">
                    {isHealthy
                      ? <CheckCircle2 size={20} className="text-emerald-200" />
                      : <AlertTriangle size={20} className="text-rose-200" />}
                    <p className="text-xs font-bold uppercase tracking-widest text-white/70">{t('disease_disease')}</p>
                  </div>
                  <h2 className="font-display font-black text-2xl sm:text-3xl mb-1">{result.disease}</h2>
                  {result.plant && <p className="text-sm text-white/70">{t('disease_plant')}: <strong className="text-white">{result.plant}</strong></p>}
                  {confidence !== null && (
                    <div className="mt-5">
                      <div className="flex justify-between text-xs text-white/70 mb-1">
                        <span>{t('disease_confidence')}</span><span>{confidence}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/20">
                        <div className="h-2 rounded-full bg-white/80 transition-all duration-700" style={{ width: `${confidence}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {result.remedy && (
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl p-6 shadow-sm animate-fadeInUp">
                    <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Remedy / Treatment</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{result.remedy}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[280px]">
                <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center mb-4">
                  <ShieldAlert size={28} className="text-rose-500" />
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Upload a leaf photo to detect diseases using our AI model</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
