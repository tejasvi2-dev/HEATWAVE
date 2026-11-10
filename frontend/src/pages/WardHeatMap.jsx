import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { wardAPI } from '../services/api';
import { WardInfoPanel } from '../components/WardInfoPanel';
import { RiskBadge } from '../components/RiskBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { DemoDataBanner } from '../components/DemoDataBanner';
import { Map, Info, Search, Layers, BarChart3, Users, Thermometer, Shield } from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────
const PUNE_CENTER = [18.5204, 73.8567];
const RISK_LEVELS = ['ALL', 'EXTREME', 'VERY HIGH', 'HIGH', 'MODERATE', 'LOW'];

const RISK_COLOR_MAP = {
  extreme: '#dc2626',
  'very high': '#e11d48',
  high: '#f97316',
  moderate: '#eab308',
  low: '#22c55e',
};

const RISK_GRADIENT = [
  { level: 'Low', color: '#22c55e', range: '0–35' },
  { level: 'Moderate', color: '#eab308', range: '35–50' },
  { level: 'High', color: '#f97316', range: '50–65' },
  { level: 'Very High', color: '#e11d48', range: '65–80' },
  { level: 'Extreme', color: '#dc2626', range: '80–100' },
];

// ── Map helpers ────────────────────────────────────────────────────────────
function SetViewOnClick({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && isFinite(coords[0]) && isFinite(coords[1])) {
      map.setView(coords, 13, { animate: true });
    }
  }, [coords, map]);
  return null;
}

// Safely extract lat/lng from various data shapes
function extractCoords(w) {
  const lat = w.lat ?? w.center?.lat ?? null;
  const lng = w.lng ?? w.center?.lng ?? null;
  if (lat != null && lng != null && isFinite(lat) && isFinite(lng) && lat !== 0 && lng !== 0) {
    return [lat, lng];
  }
  return null;
}

function getWardColor(cat) {
  return RISK_COLOR_MAP[String(cat).toLowerCase()] || '#6b7280';
}

// Normalize ward data from API or mock
function normalizeWard(w, idx) {
  const coords = extractCoords(w);
  return {
    ...w,
    _id: w.id || w._id || w.name || w.wardName || `ward-${idx}`,
    name: w.name || w.wardName || `Ward ${idx + 1}`,
    lat: coords ? coords[0] : null,
    lng: coords ? coords[1] : null,
    riskScore: w.riskScore ?? w.ward_tsi ?? 50,
    riskCategory: w.riskCategory || 'Moderate',
    population: w.population ?? null,
    vulnerabilityIndex: w.vulnerabilityIndex ?? w.vulnerability ?? null,
    elderlyPercent: w.elderlyPercent ?? null,
    outdoorWorkerPercent: w.outdoorWorkerPercent ?? null,
    childrenPercent: w.childrenPercent ?? null,
    greenCoverPercent: w.greenCoverPercent ?? null,
    avgBuildingAge: w.avgBuildingAge ?? null,
    temperature: w.temperature ?? null,
    humidity: w.humidity ?? null,
    heatIndex: w.heatIndex ?? null,
    wbgtEstimate: w.wbgtEstimate ?? null,
    factors: w.factors || w.keyDrivers || [],
    _hasValidCoords: coords !== null,
  };
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function WardHeatMap() {
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');

  useEffect(() => {
    wardAPI.getAll()
      .then((res) => {
        setIsDemo(res.isDemo);
        const raw = res.data?.data || res.data || [];
        const wardList = (Array.isArray(raw) ? raw : []).map(normalizeWard);
        setWards(wardList);
        if (wardList.length > 0) setSelectedWard(wardList[0]);
      })
      .catch((err) => {
        console.error('Ward fetch error:', err);
        setWards([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredWards = useMemo(() => {
    return wards.filter((w) => {
      const matchSearch = (w.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchRisk = filterRisk === 'ALL' || (w.riskCategory || '').toUpperCase() === filterRisk;
      return matchSearch && matchRisk;
    });
  }, [wards, searchQuery, filterRisk]);

  const mappableWards = useMemo(() => filteredWards.filter(w => w._hasValidCoords), [filteredWards]);

  // Stats
  const stats = useMemo(() => {
    if (!wards.length) return null;
    const extreme = wards.filter(w => w.riskCategory?.toLowerCase() === 'extreme').length;
    const veryHigh = wards.filter(w => w.riskCategory?.toLowerCase() === 'very high').length;
    const high = wards.filter(w => w.riskCategory?.toLowerCase() === 'high').length;
    const avgRisk = Math.round(wards.reduce((s, w) => s + (w.riskScore || 0), 0) / wards.length);
    const totalPop = wards.reduce((s, w) => s + (w.population || 0), 0);
    return { extreme, veryHigh, high, avgRisk, totalPop };
  }, [wards]);

  if (loading) {
    return <LoadingSpinner message="Rendering Pune ward geospatial layers..." />;
  }

  return (
    <div className="space-y-5">
      <DemoDataBanner isDemo={isDemo} />

      {/* Header + Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Map className="w-6 h-6 text-orange-500" />
            <span>WARD HEAT RISK MAP</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            PMC administrative ward-level thermal stress exposure with demographic vulnerability overlays.
          </p>
        </div>

        {stats && (
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-1.5">
              <Shield className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-300 font-mono font-bold">{stats.extreme + stats.veryHigh}</span>
              <span className="text-gray-400">Critical Wards</span>
            </div>
            <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-orange-300 font-mono font-bold">{stats.avgRisk}</span>
              <span className="text-gray-400">Avg Risk</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-gray-200 font-mono font-bold">{stats.totalPop ? (stats.totalPop / 1_000_000).toFixed(1) + 'M' : '--'}</span>
              <span className="text-gray-400">Exposed Pop.</span>
            </div>
          </div>
        )}
      </div>

      {/* Geographic note */}
      <div className="bg-[#1a2332] border border-gray-800 p-3.5 rounded-xl flex items-start space-x-3 text-xs text-gray-300">
        <Info className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Geographic Note:</strong> Wards are represented via PMC administrative division centroid coordinates. Polygon boundary GeoJSON is not included — it must be sourced from verified PMC cadastral datasets. All coordinates are certified centroids, not arbitrary placements.
        </p>
      </div>

      {/* Main layout: Map + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-5" style={{ height: 'calc(100vh - 340px)', minHeight: '580px' }}>

        {/* Map Panel */}
        <div className="flex-1 bg-[#111827] border border-gray-800 rounded-xl overflow-hidden relative shadow-2xl flex flex-col">
          {/* Map toolbar */}
          <div className="bg-[#111827]/95 backdrop-blur border-b border-gray-800 p-3 z-10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-orange-400" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">Thermal Exposure Layer</span>
              <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded font-mono">{mappableWards.length} wards</span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 text-[10px]">
              {RISK_GRADIENT.map(g => (
                <span key={g.level} className="flex items-center gap-0.5 text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full border border-gray-700" style={{ backgroundColor: g.color }} />
                  {g.level}
                </span>
              ))}
            </div>
          </div>

          {/* Leaflet Map */}
          <div className="flex-1 relative">
            <MapContainer
              center={PUNE_CENTER}
              zoom={12}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', backgroundColor: '#0a0f1e' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              {selectedWard?._hasValidCoords && (
                <SetViewOnClick coords={[selectedWard.lat, selectedWard.lng]} />
              )}

              {mappableWards.map((w) => (
                <CircleMarker
                  key={w._id}
                  center={[w.lat, w.lng]}
                  radius={w._id === selectedWard?._id ? 18 : 12}
                  pathOptions={{
                    fillColor: getWardColor(w.riskCategory),
                    fillOpacity: 0.8,
                    color: w._id === selectedWard?._id ? '#ffffff' : '#1f2937',
                    weight: w._id === selectedWard?._id ? 3 : 1.5,
                  }}
                  eventHandlers={{ click: () => setSelectedWard(w) }}
                >
                  <Popup>
                    <div className="text-xs text-gray-900 font-sans p-1 min-w-[180px]">
                      <strong className="block text-sm font-bold text-gray-950">{w.name}</strong>
                      <div className="mt-1.5 space-y-0.5">
                        <div>Risk Score: <strong className="font-mono">{w.riskScore}/100</strong></div>
                        <div>Category: <strong>{w.riskCategory}</strong></div>
                        {w.temperature && <div>Temperature: <strong className="font-mono">{w.temperature}°C</strong></div>}
                        {w.heatIndex && <div>Heat Index: <strong className="font-mono">{w.heatIndex}°C</strong></div>}
                        {w.population && <div>Population: <strong className="font-mono">{(w.population / 1000).toFixed(0)}k</strong></div>}
                      </div>
                      <div className="mt-1.5 text-[10px] text-blue-600 font-semibold cursor-pointer">Click to load full profile →</div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[400px] flex flex-col gap-4 min-w-0">

          {/* Search & Filter Panel */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Pune Ward..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a2332] border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
              />
            </div>

            {/* Risk filter pills */}
            <div className="flex flex-wrap gap-1 text-[11px]">
              {RISK_LEVELS.map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRisk(r)}
                  className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-all ${
                    filterRisk === r
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                      : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  }`}
                >
                  {r === 'ALL' ? `All (${wards.length})` : r}
                </button>
              ))}
            </div>

            {/* Ward quick-select list */}
            <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
              {filteredWards.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-3">No wards match your filter.</p>
              )}
              {filteredWards.map((w) => (
                <button
                  key={w._id}
                  onClick={() => setSelectedWard(w)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-all ${
                    w._id === selectedWard?._id
                      ? 'bg-orange-500/15 text-orange-300 border border-orange-500/40 shadow-sm'
                      : 'hover:bg-gray-800 text-gray-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-gray-700"
                      style={{ backgroundColor: getWardColor(w.riskCategory) }}
                    />
                    <span className="font-medium truncate text-xs">{w.name}</span>
                    {w.temperature && (
                      <span className="text-[10px] text-gray-500 font-mono shrink-0">{w.temperature}°</span>
                    )}
                  </div>
                  <RiskBadge level={w.riskCategory} size="sm" />
                </button>
              ))}
            </div>
          </div>

          {/* Ward Detail Panel */}
          {selectedWard && (
            <div className="flex-1 overflow-y-auto min-h-0">
              <WardInfoPanel ward={selectedWard} onClose={() => setSelectedWard(null)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
