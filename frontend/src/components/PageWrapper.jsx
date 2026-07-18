import React from 'react'

/**
 * Wraps each page with a beautiful fixed full-screen agricultural background image
 * + a theme-adaptive gradient overlay for readability.
 */
export default function PageWrapper({ children, bgUrl }) {
  const bg = bgUrl || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1920&q=80'

  return (
    <div className="relative min-h-screen">
      {/* Background photo — fixed for parallax feel */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center scale-105 transition-opacity duration-700"
        style={{ backgroundImage: `url(${bg})`, filter: 'brightness(0.85) saturate(1.1)' }}
      />
      {/* Theme overlay */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-white/60 via-white/40 to-emerald-50/40 dark:from-gray-950/85 dark:via-gray-900/80 dark:to-emerald-950/70 backdrop-blur-[0px]" />

      {/* Page content */}
      <main className="pt-[88px] pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[90%] 2xl:max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
