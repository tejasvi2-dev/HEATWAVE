import React, { useState, useEffect } from 'react';
import { predictionAPI } from '../services/api';
import { SafeHourTimeline } from '../components/SafeHourTimeline';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { DemoDataBanner } from '../components/DemoDataBanner';
import { Clock, Briefcase, GraduationCap, HeartPulse, UserCheck, ShieldCheck, Sun } from 'lucide-react';

export default function SafeTimeAdvisory() {
  const [safeHours, setSafeHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    predictionAPI.getSafeHours()
      .then((res) => {
        setIsDemo(Boolean(res.isDemo));
        const data = res.data?.data || res.data || [];
        setSafeHours(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating safe diurnal activity windows..." />;
  }

  return (
    <div className="space-y-6">
      <DemoDataBanner isDemo={isDemo} />

      {/* Header */}
      <div className="pb-2 border-b border-gray-800">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
          <Clock className="w-6 h-6 text-orange-500" />
          <span>HEAT-SAFE TIME ADVISORY</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Hourly biometeorological windows for safe outdoor exposure, school session management, and labor shift scheduling in Pune.
        </p>
      </div>

      {/* 24-Hour Timeline */}
      <SafeHourTimeline hours={safeHours} />

      {/* Demographic Safety Directives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Outdoor & Construction Workers */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-800">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Outdoor Labor & Construction</h3>
              <span className="text-[10px] text-orange-400 font-semibold uppercase">High Exertion Vulnerability</span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-gray-300">
            <div className="bg-[#1a2332] p-3 rounded-lg border border-gray-800">
              <span className="text-emerald-400 font-bold block mb-1">Recommended Shift Windows:</span>
              <p className="text-gray-200">06:00 AM – 10:30 AM & 05:00 PM – 08:00 PM</p>
            </div>
            <div className="bg-[#1a2332] p-3 rounded-lg border border-gray-800">
              <span className="text-red-400 font-bold block mb-1">Prohibited Heavy Labor:</span>
              <p className="text-gray-200">11:30 AM – 04:00 PM (Mandatory shaded rest breaks)</p>
            </div>
            <ul className="space-y-1.5 text-gray-400 text-[11px] list-disc list-inside">
              <li>Electrolyte/ORS stations required at 50-meter intervals on construction sites.</li>
              <li>Buddy system to detect early ataxia, disorientation, or dry skin.</li>
              <li>Lightweight, light-colored cotton long-sleeve attire recommended.</li>
            </ul>
          </div>
        </div>

        {/* Schools, Universities & Students */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-800">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Schools & Sports Academies</h3>
              <span className="text-[10px] text-blue-400 font-semibold uppercase">Pediatric Thermal Safety</span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-gray-300">
            <div className="bg-[#1a2332] p-3 rounded-lg border border-gray-800">
              <span className="text-emerald-400 font-bold block mb-1">Permissible Outdoor Sports:</span>
              <p className="text-gray-200">Before 09:00 AM only</p>
            </div>
            <div className="bg-[#1a2332] p-3 rounded-lg border border-gray-800">
              <span className="text-red-400 font-bold block mb-1">Assembly & Mid-Day Recess:</span>
              <p className="text-gray-200">Zero open-sun exposure between 10:30 AM and 03:30 PM</p>
            </div>
            <ul className="space-y-1.5 text-gray-400 text-[11px] list-disc list-inside">
              <li>Mandatory classroom water bell ring every 45 minutes.</li>
              <li>Ensure cross-ventilation or fans in naturally-ventilated classrooms.</li>
              <li>Immediate cooling room triage for students reporting headache or nausea.</li>
            </ul>
          </div>
        </div>

        {/* Elderly & Vulnerable Citizens */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-800">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Elderly & Chronic Patients</h3>
              <span className="text-[10px] text-rose-400 font-semibold uppercase">Thermoregulatory Impairment</span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-gray-300">
            <div className="bg-[#1a2332] p-3 rounded-lg border border-gray-800">
              <span className="text-emerald-400 font-bold block mb-1">Safe Transit / Walk Hours:</span>
              <p className="text-gray-200">06:00 AM – 08:00 AM & 07:00 PM – 09:30 PM</p>
            </div>
            <div className="bg-[#1a2332] p-3 rounded-lg border border-gray-800">
              <span className="text-red-400 font-bold block mb-1">Indoor Confinement Window:</span>
              <p className="text-gray-200">10:30 AM – 06:00 PM</p>
            </div>
            <ul className="space-y-1.5 text-gray-400 text-[11px] list-disc list-inside">
              <li>Maintain indoor temperature &lt; 28°C via blinds, water coolers, or AC.</li>
              <li>Consult physician regarding antihypertensives and diuretics during heatwaves.</li>
              <li>Family check-in call twice daily during High/Extreme heatwave alerts.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
