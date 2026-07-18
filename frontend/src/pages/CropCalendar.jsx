import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import PageWrapper from '../components/PageWrapper'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

const CROP_CALENDAR = {
  Rice: { sow: [5, 6, 7], grow: [7, 8, 9], harvest: [10, 11], color: 'bg-emerald-500', light: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' },
  Wheat: { sow: [10, 11], grow: [12, 1, 2], harvest: [3, 4], color: 'bg-amber-500', light: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' },
  Maize: { sow: [5, 6], grow: [7, 8, 9], harvest: [10, 11], color: 'bg-yellow-500', light: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' },
  Cotton: { sow: [4, 5, 6], grow: [7, 8, 9, 10], harvest: [11, 12, 1], color: 'bg-sky-500', light: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300' },
  Sugarcane: { sow: [1, 2, 10, 11], grow: [3, 4, 5, 6, 7, 8, 9, 10], harvest: [11, 12, 1, 2], color: 'bg-lime-500', light: 'bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-300' },
  Soybean: { sow: [6, 7], grow: [7, 8, 9], harvest: [10, 11], color: 'bg-green-500', light: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' },
  Tomato: { sow: [11, 12, 1], grow: [1, 2, 3, 4], harvest: [4, 5], color: 'bg-red-500', light: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' },
  Mustard: { sow: [10, 11], grow: [12, 1], harvest: [2, 3], color: 'bg-orange-500', light: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' },
  Groundnut: { sow: [5, 6, 7], grow: [7, 8, 9], harvest: [10, 11], color: 'bg-teal-500', light: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300' },
  Onion: { sow: [10, 11], grow: [11, 12, 1], harvest: [2, 3, 4], color: 'bg-purple-500', light: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' },
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getCellType(cropData, monthIndex) {
  const m = monthIndex + 1
  if (cropData.harvest.includes(m)) return 'harvest'
  if (cropData.grow.includes(m)) return 'grow'
  if (cropData.sow.includes(m)) return 'sow'
  return null
}

const LEGEND = [
  { type: 'sow', label: 'Sowing', cls: 'bg-blue-500' },
  { type: 'grow', label: 'Growing', cls: 'bg-emerald-500' },
  { type: 'harvest', label: 'Harvest', cls: 'bg-amber-500' },
]

export default function CropCalendar() {
  const { t } = useApp()
  const [selectedCrop, setSelectedCrop] = useState(null)
  const curMonth = new Date().getMonth()

  const crops = Object.keys(CROP_CALENDAR)

  return (
    <PageWrapper bgUrl="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1920&q=80">
      <div className="w-full">

        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Calendar size={13} /> Seasonal Crop Guide
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-gray-900 dark:text-white tracking-tight mb-3">Crop Calendar</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">Month-wise sowing, growing and harvesting guide for major Indian crops</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          {LEGEND.map(l => (
            <div key={l.type} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${l.cls}`} />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Full Calendar Table */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl overflow-hidden shadow-sm mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-800/60">
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[130px]">Crop</th>
                  {MONTHS.map((m, i) => (
                    <th key={m} className={`py-4 text-center text-xs font-bold uppercase tracking-wider min-w-[60px] ${
                      i === curMonth
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {crops.map((crop, ci) => {
                  const cd = CROP_CALENDAR[crop]
                  return (
                    <tr
                      key={crop}
                      onClick={() => setSelectedCrop(selectedCrop === crop ? null : crop)}
                      className={`border-t border-gray-100 dark:border-gray-800 cursor-pointer transition-colors ${
                        selectedCrop === crop
                          ? 'bg-violet-50 dark:bg-violet-950/30'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${cd.color}`} />
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{crop}</span>
                        </div>
                      </td>
                      {MONTHS.map((_, mi) => {
                        const type = getCellType(cd, mi)
                        const isCurrentMonth = mi === curMonth
                        return (
                          <td key={mi} className={`py-3 text-center ${isCurrentMonth ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}>
                            {type === 'sow' && <div className="mx-auto w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center"><span className="text-[10px] font-black text-blue-600 dark:text-blue-400">S</span></div>}
                            {type === 'grow' && <div className="mx-auto w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center"><span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">G</span></div>}
                            {type === 'harvest' && <div className="mx-auto w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center"><span className="text-[10px] font-black text-amber-600 dark:text-amber-400">H</span></div>}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Crop detail */}
        {selectedCrop && (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-3xl p-8 shadow-sm animate-fadeInUp">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-3 h-3 rounded-full ${CROP_CALENDAR[selectedCrop].color}`} />
              <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white">{selectedCrop} — Seasonal Details</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Sowing Months', months: CROP_CALENDAR[selectedCrop].sow, color: 'from-blue-500 to-blue-600', desc: 'Best time to plant seeds' },
                { label: 'Growing Months', months: CROP_CALENDAR[selectedCrop].grow, color: 'from-emerald-500 to-teal-600', desc: 'Active growth period' },
                { label: 'Harvest Months', months: CROP_CALENDAR[selectedCrop].harvest, color: 'from-amber-500 to-orange-600', desc: 'Ready for harvest' },
              ].map(section => (
                <div key={section.label} className={`bg-gradient-to-br ${section.color} rounded-2xl p-6 text-white`}>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">{section.desc}</p>
                  <h3 className="font-bold text-lg mb-3">{section.label}</h3>
                  <div className="flex flex-wrap gap-2">
                    {section.months.map(m => (
                      <span key={m} className="px-3 py-1 rounded-full bg-white/20 text-sm font-semibold">{MONTHS[m - 1]}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
