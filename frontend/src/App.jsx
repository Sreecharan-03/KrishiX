import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Home from './pages/Home'
import CropRecommendation from './pages/CropRecommendation'
import FertilizerPredictor from './pages/FertilizerPredictor'
import DiseaseDetector from './pages/DiseaseDetector'
import YieldPredictor from './pages/YieldPredictor'
import MandiPrices from './pages/MandiPrices'
import CropCalendar from './pages/CropCalendar'

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-transparent text-gray-900 dark:text-white">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/crop" element={<CropRecommendation />} />
              <Route path="/fertilizer" element={<FertilizerPredictor />} />
              <Route path="/disease" element={<DiseaseDetector />} />
              <Route path="/yield" element={<YieldPredictor />} />
              <Route path="/prices" element={<MandiPrices />} />
              <Route path="/calendar" element={<CropCalendar />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AppProvider>
  )
}

export default App
