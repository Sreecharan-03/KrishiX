import React, { useState, useEffect, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import PageWrapper from '../components/PageWrapper'
import { Landmark, Search, TrendingUp, TrendingDown, Minus, Loader2, RefreshCw } from 'lucide-react'

const STATES = [
  'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Gujarat','Haryana','Himachal Pradesh',
  'Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal',
]

const COMMODITIES = [
  'Rice','Wheat','Maize','Soyabean','Cotton','Tomato','Onion','Potato','Groundnut',
  'Sugarcane','Bajra','Jowar','Arhar (Tur)','Moong (Green Gram)','Masur (Lentil)',
]

export default function MandiPrices() {
  const { t } = useApp()
  const [state, setState] = useState('Telangana')
  const [commodity, setCommodity] = useState('Rice')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchPrices = useCallback(async () => {
    setLoading(true); setError(''); setData([])
    try {
      const params = new URLSearchParams({
        'api-key': '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b',
        'format': 'json',
        'limit': '1000',
        'filters[state]': state,
      })
      const res = await fetch(`https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?${params}`)
      const d = await res.json()
      if (!d.records) throw new Error("Unable to retrieve records from the government Mandi API.")
      
      // Filter by commodity client-side with partial matching since API commodity names are verbose
      const filtered = commodity
        ? d.records.filter(r => r.commodity?.toLowerCase().includes(commodity.toLowerCase()))
        : d.records
      
      setData(filtered)
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setLoading(false)
    }
  }, [state, commodity, t])

  useEffect(() => { fetchPrices() }, [fetchPrices])

  const formatPrice = v => v ? `₹ ${parseFloat(v).toLocaleString('en-IN')}` : '—'

  const getPriceTrend = (modal, min, max) => {
    const m = parseFloat(modal), mn = parseFloat(min), mx = parseFloat(max)
    if (!m || !mn || !mx) return null
    const mid = (mn + mx) / 2
    if (m > mid * 1.05) return 'up'
    if (m < mid * 0.95) return 'down'
    return 'stable'
  }

  return (
    <PageWrapper bgUrl="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1920&q=80">
      <div className="w-full">

        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Landmark size={13} /> Live Market Intelligence
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-gray-900 dark:text-white tracking-tight mb-3">Mandi Prices</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">Real-time government market prices to help you sell smarter</p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl p-6 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">State</label>
              <select value={state} onChange={e => setState(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all">
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Commodity</label>
              <select value={commodity} onChange={e => setCommodity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all">
                {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={fetchPrices} disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center gap-2 hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-blue-500/30">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Fetch Prices
              </button>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-2xl px-6 py-4 text-red-600 dark:text-red-400 text-sm mb-6">{error}</div>}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={36} className="animate-spin text-blue-500" />
            <p className="text-gray-400 text-sm">Fetching live prices…</p>
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl overflow-hidden shadow-sm animate-fadeInUp">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white">{commodity} — {state}</h2>
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-semibold">{data.length} markets</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 bg-gray-50/80 dark:bg-gray-800/60">
                    <th className="px-6 py-3 text-left">Market / Mandi</th>
                    <th className="px-6 py-3 text-left">District</th>
                    <th className="px-6 py-3 text-right">Min Price</th>
                    <th className="px-6 py-3 text-right">Max Price</th>
                    <th className="px-6 py-3 text-right">Modal Price</th>
                    <th className="px-6 py-3 text-center">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => {
                    const trend = getPriceTrend(row.modal_price, row.min_price, row.max_price)
                    return (
                      <tr key={i} className="border-t border-gray-100 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{row.market || row.mandi_name || '—'}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{row.district || '—'}</td>
                        <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">{formatPrice(row.min_price)}</td>
                        <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">{formatPrice(row.max_price)}</td>
                        <td className="px-6 py-4 text-right font-bold text-blue-600 dark:text-blue-400">{formatPrice(row.modal_price)}</td>
                        <td className="px-6 py-4 text-center">
                          {trend === 'up' && <TrendingUp size={16} className="text-emerald-500 inline" />}
                          {trend === 'down' && <TrendingDown size={16} className="text-red-500 inline" />}
                          {trend === 'stable' && <Minus size={16} className="text-gray-400 inline" />}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && data.length === 0 && !error && (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4">
              <Search size={28} className="text-blue-500" />
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm">No data found. Try a different state or commodity.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
