/**
 * coolingCenterService.js — Sample cooling centres across Pune.
 *
 * ⚠️  IMPORTANT: All occupancy data in this file is SIMULATED for demo purposes.
 *     isOccupancyVerified is set to false for every entry.
 *     In production, occupancy should come from real-time IoT sensors or
 *     manual reporting by centre administrators.
 *
 * Locations use real Pune landmarks and public buildings.
 */

const COOLING_CENTERS = [
  {
    id: 'cc-pune-001',
    name: 'Savitribai Phule Pune University — Main Hall',
    address: 'Ganeshkhind Road, Aundh, Pune 411007',
    lat: 18.5529,
    lng: 73.8270,
    location: { lat: 18.5529, lng: 73.8270 },
    facilities: ['AC Hall', 'Drinking Water', 'Restrooms', 'First Aid', 'Seating Area'],
    capacity: 300,
    currentOccupancy: 45, // SIMULATED
    isOccupancyVerified: false,
    operatingHours: '9:00 AM – 7:00 PM',
    openHours: '9:00 AM – 7:00 PM',
    contactNumber: '+91-20-25601227',
    contact: '+91-20-25601227',
    isActive: true,
    isOpen: true,
    isSimulated: true,
  },
  {
    id: 'cc-pune-002',
    name: 'Pune Municipal Corporation — Main Building',
    address: 'Shivajinagar, Pune 411005',
    lat: 18.5314,
    lng: 73.8446,
    location: { lat: 18.5314, lng: 73.8446 },
    facilities: ['AC Hall', 'Drinking Water', 'Restrooms', 'Medical Aid', 'ORS Packets'],
    capacity: 200,
    currentOccupancy: 30, // SIMULATED
    isOccupancyVerified: false,
    operatingHours: '10:00 AM – 6:00 PM',
    openHours: '10:00 AM – 6:00 PM',
    contactNumber: '+91-20-25501000',
    contact: '+91-20-25501000',
    isActive: true,
    isOpen: true,
    isSimulated: true,
  },
  {
    id: 'cc-pune-003',
    name: 'Balewadi Sports Complex — Indoor Stadium',
    address: 'Balewadi High Street, Baner, Pune 411045',
    lat: 18.5726,
    lng: 73.7689,
    location: { lat: 18.5726, lng: 73.7689 },
    facilities: ['AC Hall', 'Drinking Water', 'Restrooms', 'First Aid', 'Parking', 'Food Supplies'],
    capacity: 500,
    currentOccupancy: 120, // SIMULATED
    isOccupancyVerified: false,
    operatingHours: '8:00 AM – 8:00 PM',
    openHours: '8:00 AM – 8:00 PM',
    contactNumber: '+91-20-27290001',
    contact: '+91-20-27290001',
    isActive: true,
    isOpen: true,
    isSimulated: true,
  },
  {
    id: 'cc-pune-004',
    name: 'Nehru Memorial Hall',
    address: '1241, Dr. B. Ambedkar Rd, Sadashiv Peth, Pune 411030',
    lat: 18.5100,
    lng: 73.8500,
    location: { lat: 18.5100, lng: 73.8500 },
    facilities: ['AC Hall', 'Drinking Water', 'Restrooms', 'Medical Station', 'Seating Area'],
    capacity: 250,
    currentOccupancy: 60, // SIMULATED
    isOccupancyVerified: false,
    operatingHours: '9:00 AM – 6:00 PM',
    openHours: '9:00 AM – 6:00 PM',
    contactNumber: '+91-20-24471098',
    contact: '+91-20-24471098',
    isActive: true,
    isOpen: true,
    isSimulated: true,
  },
  {
    id: 'cc-pune-005',
    name: 'Sassoon General Hospital — Heat Emergency Ward',
    address: 'Near Pune Railway Station, Pune 411001',
    lat: 18.5220,
    lng: 73.8680,
    location: { lat: 18.5220, lng: 73.8680 },
    facilities: ['Drinking Water', 'Medical Aid', 'Restrooms', 'Emergency Services', 'IV Fluids', 'Doctor On Duty'],
    capacity: 150,
    currentOccupancy: 80, // SIMULATED
    isOccupancyVerified: false,
    operatingHours: '24 Hours',
    openHours: '24 Hours',
    contactNumber: '+91-20-26128000',
    contact: '+91-20-26128000',
    isActive: true,
    isOpen: true,
    isSimulated: true,
  },
  {
    id: 'cc-pune-006',
    name: 'Hadapsar Community Hall',
    address: 'Gadital Chowk, Hadapsar, Pune 411028',
    lat: 18.5040,
    lng: 73.9260,
    location: { lat: 18.5040, lng: 73.9260 },
    facilities: ['AC Hall', 'Drinking Water', 'Restrooms', 'First Aid'],
    capacity: 180,
    currentOccupancy: 25, // SIMULATED
    isOccupancyVerified: false,
    operatingHours: '9:00 AM – 7:00 PM',
    openHours: '9:00 AM – 7:00 PM',
    contactNumber: '+91-20-26990012',
    contact: '+91-20-26990012',
    isActive: true,
    isOpen: true,
    isSimulated: true,
  },
  {
    id: 'cc-pune-007',
    name: 'Deccan Gymkhana — Indoor Pavilion',
    address: 'Jangli Maharaj Road, Deccan Gymkhana, Pune 411004',
    lat: 18.5190,
    lng: 73.8400,
    location: { lat: 18.5190, lng: 73.8400 },
    facilities: ['AC Hall', 'Drinking Water', 'Restrooms', 'Parking', 'Fans'],
    capacity: 200,
    currentOccupancy: 35, // SIMULATED
    isOccupancyVerified: false,
    operatingHours: '10:00 AM – 6:00 PM',
    openHours: '10:00 AM – 6:00 PM',
    contactNumber: '+91-20-25670123',
    contact: '+91-20-25670123',
    isActive: true,
    isOpen: true,
    isSimulated: true,
  },
  {
    id: 'cc-pune-008',
    name: 'Yerawada Community Centre & Cool Room',
    address: 'Near Yerawada Jail, Nagar Road, Pune 411006',
    lat: 18.5560,
    lng: 73.8880,
    location: { lat: 18.5560, lng: 73.8880 },
    facilities: ['Drinking Water', 'Restrooms', 'First Aid', 'Fans', 'Reading Room'],
    capacity: 120,
    currentOccupancy: 15, // SIMULATED
    isOccupancyVerified: false,
    operatingHours: '9:00 AM – 5:00 PM',
    openHours: '9:00 AM – 5:00 PM',
    contactNumber: '+91-20-26680045',
    contact: '+91-20-26680045',
    isActive: true,
    isOpen: true,
    isSimulated: true,
  },
  {
    id: 'cc-pune-009',
    name: 'Swargate Bus Stand — Passenger Transit Cooling Lounge',
    address: 'Swargate, Pune 411037',
    lat: 18.5010,
    lng: 73.8624,
    location: { lat: 18.5010, lng: 73.8624 },
    facilities: ['Drinking Water', 'Restrooms', 'Fans', 'Seating', 'ORS Dispensary'],
    capacity: 100,
    currentOccupancy: 50, // SIMULATED
    isOccupancyVerified: false,
    operatingHours: '6:00 AM – 11:00 PM',
    openHours: '6:00 AM – 11:00 PM',
    contactNumber: '+91-20-24440400',
    contact: '+91-20-24440400',
    isActive: true,
    isOpen: true,
    isSimulated: true,
  },
  {
    id: 'cc-pune-010',
    name: 'Kothrud Samaj Mandir',
    address: 'Paud Road, Kothrud, Pune 411038',
    lat: 18.5050,
    lng: 73.8100,
    location: { lat: 18.5050, lng: 73.8100 },
    facilities: ['AC Hall', 'Drinking Water', 'Restrooms', 'First Aid'],
    capacity: 160,
    currentOccupancy: 20, // SIMULATED
    isOccupancyVerified: false,
    operatingHours: '9:00 AM – 6:00 PM',
    openHours: '9:00 AM – 6:00 PM',
    contactNumber: '+91-20-25460078',
    contact: '+91-20-25460078',
    isActive: true,
    isOpen: true,
    isSimulated: true,
  },
];

/**
 * Return all cooling centres, optionally filtered to only active ones.
 *
 * @param {Object} options
 * @param {boolean} options.activeOnly — if true, return only isActive centres
 * @returns {Array<Object>}
 */
function getAllCoolingCenters({ activeOnly = true } = {}) {
  if (activeOnly) {
    return COOLING_CENTERS.filter((c) => c.isActive);
  }
  return [...COOLING_CENTERS];
}

/**
 * Find the nearest cooling centres to a given lat/lng.
 * Uses the Haversine formula for distance calculation.
 *
 * @param {number} lat — user latitude
 * @param {number} lng — user longitude
 * @param {number} limit — max results (default 5)
 * @returns {Array<Object>} — centres sorted by distance (nearest first)
 */
function getNearestCoolingCenters(lat, lng, limit = 5) {
  const centersWithDistance = COOLING_CENTERS.filter((c) => c.isActive).map((center) => {
    const distance = haversineDistance(lat, lng, center.location.lat, center.location.lng);
    return { ...center, distanceKm: Math.round(distance * 100) / 100 };
  });

  centersWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

  return centersWithDistance.slice(0, limit);
}

/**
 * Haversine formula — great-circle distance between two points on Earth.
 *
 * @param {number} lat1 — latitude of point 1 (degrees)
 * @param {number} lng1 — longitude of point 1 (degrees)
 * @param {number} lat2 — latitude of point 2 (degrees)
 * @param {number} lng2 — longitude of point 2 (degrees)
 * @returns {number} — distance in kilometres
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

module.exports = {
  COOLING_CENTERS,
  getAllCoolingCenters,
  getNearestCoolingCenters,
};
