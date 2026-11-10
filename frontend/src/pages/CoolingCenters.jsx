import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { coolingCenterAPI } from '../services/api';
import { CoolingCenterCard } from '../components/CoolingCenterCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { DemoDataBanner } from '../components/DemoDataBanner';
import { Building2, Search, Info, MapPin, Snowflake, Users, Phone } from 'lucide-react';

// ── Custom DivIcon for cooling center markers ──────────────────────────────
const createCoolingIcon = (isSelected) => new L.DivIcon({
  className: 'custom-cooling-marker',
  html: `<div style="
    background: ${isSelected ? '#f97316' : '#2563eb'};
    color: white;
    border-radius: 9999px;
    width: ${isSelected ? '40px' : '32px'};
    height: ${isSelected ? '40px' : '32px'};
    display: flex;
    align-items: center;
    justify-content: center;
    border: ${isSelected ? '3px' : '2px'} solid white;
    box-shadow: 0 4px 12px -2px rgba(0,0,0,0.5);
    transition: all 0.2s;
  "><svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? '22' : '16'}" height="${isSelected ? '22' : '16'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h10"/><path d="M9 4v16"/><path d="m3 9 3 3-3 3"/><path d="M12 6 9 9 6 6"/><path d="m6 18 3-3 1.5 1.5"/><path d="M20 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg></div>`,
  iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
  iconAnchor: [isSelected ? 20 : 16, isSelected ? 20 : 16],
  popupAnchor: [0, isSelected ? -20 : -16],
});

const defaultIcon = createCoolingIcon(false);
const selectedIcon = createCoolingIcon(true);

// ── Facility categories for filtering ──────────────────────────────────────
const FACILITY_FILTERS = ['All', 'AC Hall', 'Medical Aid', 'First Aid', 'Food', 'Restrooms', 'Parking', '24 Hours'];

// ── Map fly-to helper ──────────────────────────────────────────────────────
function FlyToCenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && isFinite(coords[0]) && isFinite(coords[1])) {
      map.flyTo(coords, 15, { duration: 1.0 });
    }
  }, [coords, map]);
  return null;
}

// ── Safely extract coordinates ─────────────────────────────────────────────
function getCoords(c) {
  const lat = c.lat ?? c.location?.lat ?? null;
  const lng = c.lng ?? c.location?.lng ?? null;
  if (lat != null && lng != null && isFinite(lat) && isFinite(lng)) return [lat, lng];
  return null;
}

// ── Normalize center data ──────────────────────────────────────────────────
function normalizeCenter(c, idx) {
  const coords = getCoords(c);
  return {
    ...c,
    _id: c.id || c._id || `cc-${idx}`,
    name: c.name || `Cooling Center ${idx + 1}`,
    address: c.address || 'Pune, Maharashtra',
    lat: coords ? coords[0] : null,
    lng: coords ? coords[1] : null,
    facilities: c.facilities || [],
    capacity: c.capacity || 0,
    currentOccupancy: c.currentOccupancy || 0,
    isOpen: c.isOpen ?? c.isActive ?? true,
    openHours: c.openHours || c.operatingHours || 'Not specified',
    contact: c.contact || c.contactNumber || '',
    isSimulated: c.isSimulated ?? c.isOccupancyVerified === false ?? true,
    _hasCoords: coords !== null,
  };
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function CoolingCenters() {
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('All');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    coolingCenterAPI.getAll()
      .then((res) => {
        setIsDemo(res.isDemo);
        const raw = res.data?.data || res.data || [];
        const list = (Array.isArray(raw) ? raw : []).map(normalizeCenter);
        setCenters(list);
        if (list.length > 0) setSelectedCenter(list[0]);
      })
      .catch((err) => console.error('Cooling center fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return centers.filter((c) => {
      const matchSearch = (c.name + ' ' + c.address).toLowerCase().includes(searchQuery.toLowerCase());
      const matchFacility = facilityFilter === 'All' || c.facilities.some(f => f.toLowerCase().includes(facilityFilter.toLowerCase())) || (facilityFilter === '24 Hours' && c.openHours?.includes('24'));
      const matchOpen = !showOpenOnly || c.isOpen;
      return matchSearch && matchFacility && matchOpen;
    });
  }, [centers, searchQuery, facilityFilter, showOpenOnly]);

  const mappable = useMemo(() => filtered.filter(c => c._hasCoords), [filtered]);

  // Summary stats
  const stats = useMemo(() => {
    const open = centers.filter(c => c.isOpen).length;
    const totalCap = centers.reduce((s, c) => s + (c.capacity || 0), 0);
    const totalOcc = centers.reduce((s, c) => s + (c.currentOccupancy || 0), 0);
    return { open, total: centers.length, totalCap, totalOcc, available: totalCap - totalOcc };
  }, [centers]);

  if (loading) {
    return <LoadingSpinner message="Locating certified cooling shelters and relief halls..." />;
  }

  return (
    <div className="space-y-5">
      <DemoDataBanner isDemo={isDemo} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-blue-500" />
            <span>COOLING CENTER NAVIGATOR</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Public air-conditioned halls, hydration relief stations, and shaded shelters across Pune Municipal Corporation.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-1.5">
            <Snowflake className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300 font-mono font-bold">{stats.open}</span>
            <span className="text-gray-400">Open Now</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-1.5">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-300 font-mono font-bold">{stats.available.toLocaleString()}</span>
            <span className="text-gray-400">Available Seats</span>
          </div>
        </div>
      </div>

      {/* Disclosure notice */}
      <div className="bg-[#1a2332] border border-gray-800 p-3.5 rounded-xl flex items-start space-x-3 text-xs text-gray-300">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Facility Data Notice:</strong> Physical locations represent verified public buildings — university halls, municipal offices, community complexes, and hospitals in Pune. Real-time occupancy counts are <span className="text-amber-300 font-semibold">simulated estimates</span> pending PMC IoT sensor integration. Use Google Maps navigation for verified directions.
        </p>
      </div>

      {/* Map + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-5" style={{ height: 'calc(100vh - 380px)', minHeight: '520px' }}>

        {/* Map */}
        <div className="flex-1 bg-[#111827] border border-gray-800 rounded-xl overflow-hidden relative shadow-2xl flex flex-col">
          <div className="bg-[#111827]/95 backdrop-blur border-b border-gray-800 p-3 z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">Cooling Shelter Map</span>
              <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded font-mono">{mappable.length} locations</span>
            </div>
          </div>

          <div className="flex-1 relative">
            <MapContainer
              center={[18.5204, 73.8567]}
              zoom={12}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', backgroundColor: '#0a0f1e' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {selectedCenter?._hasCoords && (
                <FlyToCenter coords={[selectedCenter.lat, selectedCenter.lng]} />
              )}

              {mappable.map((c) => (
                <Marker
                  key={c._id}
                  position={[c.lat, c.lng]}
                  icon={c._id === selectedCenter?._id ? selectedIcon : defaultIcon}
                  eventHandlers={{ click: () => setSelectedCenter(c) }}
                >
                  <Popup>
                    <div className="text-xs font-sans text-gray-900 p-1 min-w-[200px]">
                      <strong className="block text-sm font-bold text-gray-950">{c.name}</strong>
                      <p className="text-gray-600 mt-1 flex items-start gap-1">
                        <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                        {c.address}
                      </p>
                      <div className="mt-2 text-[11px] space-y-0.5">
                        <div>Hours: <strong>{c.openHours}</strong></div>
                        <div>Capacity: <strong>{c.currentOccupancy}/{c.capacity}</strong></div>
                        <div>Status: <strong className={c.isOpen ? 'text-green-600' : 'text-red-600'}>{c.isOpen ? 'OPEN' : 'CLOSED'}</strong></div>
                      </div>
                      {c.contact && (
                        <a href={`tel:${c.contact}`} className="mt-1.5 text-[11px] text-blue-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />{c.contact}
                        </a>
                      )}
                      <button
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`, '_blank')}
                        className="mt-2 text-[11px] bg-blue-600 text-white px-3 py-1.5 rounded block w-full text-center font-semibold hover:bg-blue-700 transition"
                      >
                        🧭 Navigate via Google Maps
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Sidebar: Search + Filters + Cards */}
        <div className="w-full lg:w-[420px] flex flex-col gap-4 min-w-0">

          {/* Search & filters */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name or locality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a2332] border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>

            {/* Facility filter pills */}
            <div className="flex flex-wrap gap-1 text-[11px]">
              {FACILITY_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFacilityFilter(f)}
                  className={`px-2 py-1 rounded-md whitespace-nowrap font-medium transition-all ${
                    facilityFilter === f
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Open only toggle */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Showing {filtered.length} shelter{filtered.length !== 1 ? 's' : ''}</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-[11px]">Open Only</span>
                <div
                  onClick={() => setShowOpenOnly(!showOpenOnly)}
                  className={`w-8 h-4 rounded-full cursor-pointer transition-colors flex items-center ${showOpenOnly ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'}`}
                >
                  <div className="w-3.5 h-3.5 bg-white rounded-full mx-0.5 shadow-sm" />
                </div>
              </label>
            </div>
          </div>

          {/* Center cards list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
            {filtered.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-xs">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No cooling centers match your filters.</p>
              </div>
            )}
            {filtered.map((c) => (
              <div
                key={c._id}
                onClick={() => setSelectedCenter(c)}
                className={`cursor-pointer transition-all rounded-xl ${
                  c._id === selectedCenter?._id ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/10' : ''
                }`}
              >
                <CoolingCenterCard center={c} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
