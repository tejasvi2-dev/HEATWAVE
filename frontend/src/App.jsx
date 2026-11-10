import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import CommandCenter from './pages/CommandCenter';
import ThermalStressAnalyzer from './pages/ThermalStressAnalyzer';
import WardHeatMap from './pages/WardHeatMap';
import AIPredictions from './pages/AIPredictions';
import SmartAlerts from './pages/SmartAlerts';
import SafeTimeAdvisory from './pages/SafeTimeAdvisory';
import CoolingCenters from './pages/CoolingCenters';

export default function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<CommandCenter />} />
          <Route path="/thermal-stress" element={<ThermalStressAnalyzer />} />
          <Route path="/ward-map" element={<WardHeatMap />} />
          <Route path="/predictions" element={<AIPredictions />} />
          <Route path="/alerts" element={<SmartAlerts />} />
          <Route path="/safe-hours" element={<SafeTimeAdvisory />} />
          <Route path="/cooling-centers" element={<CoolingCenters />} />
          <Route path="*" element={<CommandCenter />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
