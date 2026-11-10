import React from 'react';
import { MapPin, Navigation, Clock, Phone, Snowflake } from 'lucide-react';

export const CoolingCenterCard = ({ center }) => {
  if (!center) return null;

  const occupancyPct = center.capacity
    ? Math.round((center.currentOccupancy / center.capacity) * 100)
    : 0;

  const handleNavigate = (e) => {
    e.stopPropagation();
    const lat = center.lat ?? center.location?.lat;
    const lng = center.lng ?? center.location?.lng;
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-lg space-y-3 hover:border-gray-600 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-white leading-tight">{center.name}</h4>
          <p className="text-[11px] text-gray-400 flex items-start mt-1 gap-1">
            <MapPin className="w-3 h-3 text-gray-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{center.address}</span>
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md shrink-0 ${
          center.isOpen !== false ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
        }`}>
          {center.isOpen !== false ? '● OPEN' : '● CLOSED'}
        </span>
      </div>

      {/* Facilities */}
      {center.facilities && center.facilities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {center.facilities.map((fac, i) => (
            <span key={i} className="text-[10px] bg-gray-800/80 text-gray-300 px-2 py-0.5 rounded-md border border-gray-700/50">
              {fac}
            </span>
          ))}
        </div>
      )}

      {/* Occupancy */}
      {center.capacity > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-gray-400 flex items-center gap-1">
              <Snowflake className="w-3 h-3 text-blue-400" />
              <span>{center.currentOccupancy || 0} / {center.capacity}</span>
              {center.isSimulated && (
                <span className="text-[8px] text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded font-mono">SIM</span>
              )}
            </span>
            <span className={`font-mono font-semibold ${occupancyPct > 80 ? 'text-red-400' : occupancyPct > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {occupancyPct}% full
            </span>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                occupancyPct > 80 ? 'bg-red-500' : occupancyPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, occupancyPct)}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between text-[11px] text-gray-400">
        <div className="flex items-center gap-3">
          {center.openHours && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-500" />
              {center.openHours}
            </span>
          )}
          {center.contact && (
            <a href={`tel:${center.contact}`} className="hidden sm:flex items-center gap-1 hover:text-white transition" onClick={e => e.stopPropagation()}>
              <Phone className="w-3 h-3 text-gray-500" />
              {center.contact}
            </a>
          )}
        </div>

        <button
          onClick={handleNavigate}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition shadow-sm"
        >
          <Navigation className="w-3 h-3" />
          <span>Directions</span>
        </button>
      </div>
    </div>
  );
};
