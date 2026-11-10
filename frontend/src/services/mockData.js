// ============================================================
// HEATGUARD AI - Comprehensive Mock/Fallback Data
// ============================================================
// ALL DATA BELOW IS SIMULATED FOR DEVELOPMENT/DEMO PURPOSES.
// None of this data represents real-time weather conditions.
// Connect the backend API for live weather data.
// ============================================================

const now = new Date();
const formatHour = (hoursOffset) => {
  const d = new Date(now.getTime() + hoursOffset * 3600000);
  return d.toISOString();
};

const formatDay = (daysOffset) => {
  const d = new Date(now.getTime() + daysOffset * 86400000);
  return d.toISOString().split('T')[0];
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// --- Current Weather ---
export const mockCurrentWeather = {
  temperature: 35,
  humidity: 45,
  windSpeed: 12,
  windDirection: 'WSW',
  solarRadiation: 750,
  heatIndex: 38,
  wbgtEstimate: 28,
  thermalStressIndex: 52,
  riskCategory: 'High',
  feelsLike: 38,
  pressure: 1008,
  uvIndex: 9,
  visibility: 8,
  dewPoint: 22,
  condition: 'Partly Cloudy',
  timestamp: now.toISOString(),
  location: 'Pune, Maharashtra, India',
  isSimulated: true,
};

// --- Hourly Forecast (5 days = 120 hours, sampled every 3 hours) ---
const generateHourlyForecast = () => {
  const hours = [];
  for (let i = 0; i < 120; i += 3) {
    const hourOfDay = (now.getHours() + i) % 24;
    // Simulate diurnal temperature cycle
    const baseTemp = 34;
    const amplitude = 5;
    const tempVariation = amplitude * Math.sin(((hourOfDay - 6) / 24) * Math.PI * 2 - Math.PI / 2);
    const dayOffset = Math.floor(i / 24);
    const trendIncrease = dayOffset * 0.8; // warming trend over 5 days
    const temperature = parseFloat((baseTemp + tempVariation + trendIncrease + (Math.random() * 2 - 1)).toFixed(1));

    const humidity = Math.max(20, Math.min(80, 50 - (temperature - 34) * 3 + (Math.random() * 10 - 5)));
    const heatIndex = parseFloat((temperature + (humidity / 100) * 5).toFixed(1));
    const thermalStress = Math.min(100, Math.max(0, (temperature - 25) * 3 + humidity * 0.2));

    let riskCategory = 'Low';
    if (thermalStress > 75) riskCategory = 'Extreme';
    else if (thermalStress > 60) riskCategory = 'Very High';
    else if (thermalStress > 45) riskCategory = 'High';
    else if (thermalStress > 30) riskCategory = 'Moderate';

    hours.push({
      timestamp: formatHour(i),
      temperature,
      humidity: parseFloat(humidity.toFixed(1)),
      heatIndex,
      thermalStressIndex: parseFloat(thermalStress.toFixed(1)),
      riskCategory,
      windSpeed: parseFloat((10 + Math.random() * 8).toFixed(1)),
      solarRadiation: hourOfDay >= 6 && hourOfDay <= 18 ? Math.round(200 + 600 * Math.sin(((hourOfDay - 6) / 12) * Math.PI)) : 0,
      condition: hourOfDay >= 6 && hourOfDay <= 18 ? 'Partly Cloudy' : 'Clear',
      isSimulated: true,
    });
  }
  return hours;
};

export const mockForecast = generateHourlyForecast();

// --- Daily Forecast ---
export const mockDailyForecast = Array.from({ length: 5 }, (_, i) => {
  const date = new Date(now.getTime() + i * 86400000);
  const dayName = dayNames[date.getDay()];
  const baseHigh = 36 + i * 0.8 + (Math.random() * 2 - 1);
  const baseLow = 24 + (Math.random() * 2 - 1);
  const avgTemp = (baseHigh + baseLow) / 2;
  const thermalStress = Math.min(100, (avgTemp - 25) * 3 + 15);

  let riskCategory = 'Low';
  if (thermalStress > 75) riskCategory = 'Extreme';
  else if (thermalStress > 60) riskCategory = 'Very High';
  else if (thermalStress > 45) riskCategory = 'High';
  else if (thermalStress > 30) riskCategory = 'Moderate';

  return {
    date: formatDay(i),
    dayName,
    tempMax: parseFloat(baseHigh.toFixed(1)),
    tempMin: parseFloat(baseLow.toFixed(1)),
    tempAvg: parseFloat(avgTemp.toFixed(1)),
    humidity: Math.round(40 + Math.random() * 20),
    riskCategory,
    thermalStressIndex: parseFloat(thermalStress.toFixed(1)),
    condition: i < 3 ? 'Partly Cloudy' : 'Sunny',
    windSpeed: parseFloat((8 + Math.random() * 10).toFixed(1)),
    isSimulated: true,
  };
});

// --- Alerts ---
export const mockAlerts = [
  {
    id: 'alert-demo-001',
    severity: 'Extreme',
    title: 'Extreme Heat Warning — Pune City',
    description:
      'Temperatures expected to exceed 42°C in multiple wards. Heat index may reach dangerous levels. Outdoor activity strongly discouraged between 11 AM and 5 PM.',
    affectedWards: ['Kasba Peth', 'Shukrawar Peth', 'Bhavani Peth', 'Hadapsar'],
    recommendations: [
      'Stay indoors during peak hours (11 AM – 5 PM)',
      'Drink water every 20 minutes even if not thirsty',
      'Check on elderly neighbors and outdoor workers',
      'Seek nearest cooling center if you feel dizzy or nauseous',
      'Wear light, loose-fitting clothing and a hat outdoors',
    ],
    issuedAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
    expiresAt: new Date(now.getTime() + 10 * 3600000).toISOString(),
    isSimulated: true,
    source: 'HEATGUARD AI Demo',
  },
  {
    id: 'alert-demo-002',
    severity: 'High',
    title: 'Heat Advisory — Elevated Thermal Stress',
    description:
      'Sustained high temperatures and humidity creating elevated heat index values. Vulnerable populations should take precautions.',
    affectedWards: ['Kothrud', 'Warje', 'Sinhagad Road', 'Dhankawadi'],
    recommendations: [
      'Limit outdoor physical activity',
      'Stay hydrated — carry water at all times',
      'Use sunscreen and protective clothing',
      'Monitor for symptoms of heat exhaustion',
    ],
    issuedAt: new Date(now.getTime() - 5 * 3600000).toISOString(),
    expiresAt: new Date(now.getTime() + 8 * 3600000).toISOString(),
    isSimulated: true,
    source: 'HEATGUARD AI Demo',
  },
  {
    id: 'alert-demo-003',
    severity: 'Moderate',
    title: 'Heat Watch — Warming Trend Expected',
    description:
      'Temperatures trending upward over the next 3 days. Conditions may escalate to High risk by midweek.',
    affectedWards: ['Aundh', 'Baner', 'Pashan', 'Hinjewadi'],
    recommendations: [
      'Plan outdoor activities for morning or evening',
      'Ensure adequate hydration throughout the day',
      'Keep living spaces ventilated',
    ],
    issuedAt: new Date(now.getTime() - 1 * 3600000).toISOString(),
    expiresAt: new Date(now.getTime() + 48 * 3600000).toISOString(),
    isSimulated: true,
    source: 'HEATGUARD AI Demo',
  },
];

// --- Wards (15 Pune Wards with certified centroid coordinates & vulnerability profiles) ---
export const mockWards = [
  { name: 'Aundh-Baner', wardName: 'Aundh-Baner', lat: 18.5580, lng: 73.8077, center: { lat: 18.5580, lng: 73.8077 }, riskScore: 45, ward_tsi: 45, riskCategory: 'Moderate', population: 285000, vulnerabilityIndex: 0.38, vulnerability: 0.38, elderlyPercent: 11, outdoorWorkerPercent: 18, childrenPercent: 14, greenCoverPercent: 22, avgBuildingAge: 15, temperature: 34.8, humidity: 46, heatIndex: 37.5, wbgtEstimate: 27.8, factors: ['Moderate building density', 'Active IT corridor', 'Good green cover'], isSimulated: true },
  { name: 'Kothrud-Bavdhan', wardName: 'Kothrud-Bavdhan', lat: 18.5074, lng: 73.8077, center: { lat: 18.5074, lng: 73.8077 }, riskScore: 52, ward_tsi: 52, riskCategory: 'High', population: 310000, vulnerabilityIndex: 0.42, vulnerability: 0.42, elderlyPercent: 13, outdoorWorkerPercent: 15, childrenPercent: 16, greenCoverPercent: 18, avgBuildingAge: 20, temperature: 35.6, humidity: 44, heatIndex: 38.6, wbgtEstimate: 28.5, factors: ['High population density', 'Aging infrastructure', 'Foothill topography'], isSimulated: true },
  { name: 'Kasba Peth', wardName: 'Kasba-Vishrambaug', lat: 18.5120, lng: 73.8560, center: { lat: 18.5120, lng: 73.8560 }, riskScore: 72, ward_tsi: 72, riskCategory: 'Very High', population: 150000, vulnerabilityIndex: 0.68, vulnerability: 0.68, elderlyPercent: 18, outdoorWorkerPercent: 28, childrenPercent: 12, greenCoverPercent: 5, avgBuildingAge: 45, temperature: 37.4, humidity: 41, heatIndex: 41.2, wbgtEstimate: 30.8, factors: ['Very low green cover', 'Old dense construction', 'High outdoor worker population'], isSimulated: true },
  { name: 'Shukrawar Peth', wardName: 'Shukrawar Peth', lat: 18.5170, lng: 73.8500, center: { lat: 18.5170, lng: 73.8500 }, riskScore: 68, ward_tsi: 68, riskCategory: 'Very High', population: 120000, vulnerabilityIndex: 0.62, vulnerability: 0.62, elderlyPercent: 16, outdoorWorkerPercent: 25, childrenPercent: 13, greenCoverPercent: 6, avgBuildingAge: 50, temperature: 36.9, humidity: 42, heatIndex: 40.5, wbgtEstimate: 30.1, factors: ['Historic area with dense construction', 'Limited ventilation corridors', 'Heavy asphalt coverage'], isSimulated: true },
  { name: 'Bhavani Peth', wardName: 'Bhavani Peth', lat: 18.5080, lng: 73.8650, center: { lat: 18.5080, lng: 73.8650 }, riskScore: 82, ward_tsi: 82, riskCategory: 'Extreme', population: 130000, vulnerabilityIndex: 0.72, vulnerability: 0.72, elderlyPercent: 15, outdoorWorkerPercent: 32, childrenPercent: 15, greenCoverPercent: 3, avgBuildingAge: 40, temperature: 38.2, humidity: 40, heatIndex: 42.8, wbgtEstimate: 31.9, factors: ['Highest outdoor worker density', 'Minimal green cover', 'Severe urban heat island effect'], isSimulated: true },
  { name: 'Hadapsar-Mundhwa', wardName: 'Hadapsar-Mundhwa', lat: 18.5018, lng: 73.9260, center: { lat: 18.5018, lng: 73.9260 }, riskScore: 58, ward_tsi: 58, riskCategory: 'High', population: 420000, vulnerabilityIndex: 0.48, vulnerability: 0.48, elderlyPercent: 10, outdoorWorkerPercent: 22, childrenPercent: 18, greenCoverPercent: 15, avgBuildingAge: 12, temperature: 36.0, humidity: 45, heatIndex: 39.4, wbgtEstimate: 29.0, factors: ['Rapid urbanization', 'Industrial zones', 'Intense construction activity'], isSimulated: true },
  { name: 'Warje-Karvenagar', wardName: 'Warje-Karvenagar', lat: 18.4860, lng: 73.8060, center: { lat: 18.4860, lng: 73.8060 }, riskScore: 48, ward_tsi: 48, riskCategory: 'Moderate', population: 195000, vulnerabilityIndex: 0.40, vulnerability: 0.40, elderlyPercent: 9, outdoorWorkerPercent: 20, childrenPercent: 17, greenCoverPercent: 20, avgBuildingAge: 10, temperature: 35.1, humidity: 46, heatIndex: 37.9, wbgtEstimate: 28.1, factors: ['Residential growth area', 'Moderate green cover', 'River valley breeze'], isSimulated: true },
  { name: 'Sinhagad Road', wardName: 'Sinhagad Road', lat: 18.4700, lng: 73.8270, center: { lat: 18.4700, lng: 73.8270 }, riskScore: 42, ward_tsi: 42, riskCategory: 'Moderate', population: 250000, vulnerabilityIndex: 0.35, vulnerability: 0.35, elderlyPercent: 10, outdoorWorkerPercent: 16, childrenPercent: 19, greenCoverPercent: 25, avgBuildingAge: 8, temperature: 34.5, humidity: 47, heatIndex: 37.1, wbgtEstimate: 27.5, factors: ['Good green cover from nearby hills', 'Newer construction standards'], isSimulated: true },
  { name: 'Dhankawadi-Sahakarnagar', wardName: 'Dhankawadi-Sahakarnagar', lat: 18.4580, lng: 73.8490, center: { lat: 18.4580, lng: 73.8490 }, riskScore: 50, ward_tsi: 50, riskCategory: 'High', population: 175000, vulnerabilityIndex: 0.44, vulnerability: 0.44, elderlyPercent: 12, outdoorWorkerPercent: 24, childrenPercent: 16, greenCoverPercent: 14, avgBuildingAge: 18, temperature: 35.4, humidity: 45, heatIndex: 38.5, wbgtEstimate: 28.4, factors: ['Mixed land use', 'Growing density', 'Transit corridors'], isSimulated: true },
  { name: 'Baner', wardName: 'Baner', lat: 18.5590, lng: 73.7868, center: { lat: 18.5590, lng: 73.7868 }, riskScore: 38, ward_tsi: 38, riskCategory: 'Moderate', population: 220000, vulnerabilityIndex: 0.32, vulnerability: 0.32, elderlyPercent: 8, outdoorWorkerPercent: 12, childrenPercent: 20, greenCoverPercent: 24, avgBuildingAge: 7, temperature: 34.2, humidity: 48, heatIndex: 36.8, wbgtEstimate: 27.2, factors: ['Modern construction', 'Higher green cover', 'Well ventilated avenues'], isSimulated: true },
  { name: 'Pashan', wardName: 'Pashan', lat: 18.5380, lng: 73.7870, center: { lat: 18.5380, lng: 73.7870 }, riskScore: 28, ward_tsi: 28, riskCategory: 'Low', population: 160000, vulnerabilityIndex: 0.28, vulnerability: 0.28, elderlyPercent: 9, outdoorWorkerPercent: 10, childrenPercent: 15, greenCoverPercent: 35, avgBuildingAge: 12, temperature: 33.6, humidity: 49, heatIndex: 35.8, wbgtEstimate: 26.5, factors: ['Highest green cover in PMC', 'Lake and wetland microclimate cooling', 'Research institutions area'], isSimulated: true },
  { name: 'Hinjewadi', wardName: 'Hinjewadi', lat: 18.5912, lng: 73.7380, center: { lat: 18.5912, lng: 73.7380 }, riskScore: 40, ward_tsi: 40, riskCategory: 'Moderate', population: 180000, vulnerabilityIndex: 0.34, vulnerability: 0.34, elderlyPercent: 6, outdoorWorkerPercent: 14, childrenPercent: 12, greenCoverPercent: 20, avgBuildingAge: 5, temperature: 34.4, humidity: 47, heatIndex: 37.0, wbgtEstimate: 27.4, factors: ['IT park area', 'Modern campus infrastructure', 'Expansive roads'], isSimulated: true },
  { name: 'Viman Nagar', wardName: 'Viman Nagar', lat: 18.5679, lng: 73.9143, center: { lat: 18.5679, lng: 73.9143 }, riskScore: 55, ward_tsi: 55, riskCategory: 'High', population: 200000, vulnerabilityIndex: 0.46, vulnerability: 0.46, elderlyPercent: 11, outdoorWorkerPercent: 19, childrenPercent: 16, greenCoverPercent: 12, avgBuildingAge: 14, temperature: 35.8, humidity: 43, heatIndex: 38.9, wbgtEstimate: 28.7, factors: ['Airport proximity', 'Concrete-heavy area', 'Urban heat island effect'], isSimulated: true },
  { name: 'Bibwewadi-Kondhwa', wardName: 'Bibwewadi-Kondhwa', lat: 18.4680, lng: 73.8820, center: { lat: 18.4680, lng: 73.8820 }, riskScore: 47, ward_tsi: 47, riskCategory: 'Moderate', population: 230000, vulnerabilityIndex: 0.39, vulnerability: 0.39, elderlyPercent: 10, outdoorWorkerPercent: 21, childrenPercent: 18, greenCoverPercent: 18, avgBuildingAge: 10, temperature: 35.0, humidity: 46, heatIndex: 37.8, wbgtEstimate: 28.0, factors: ['Developing suburb', 'Mixed construction quality', 'Growing commercial hub'], isSimulated: true },
  { name: 'Yerawada', wardName: 'Yerawada', lat: 18.5560, lng: 73.8870, center: { lat: 18.5560, lng: 73.8870 }, riskScore: 60, ward_tsi: 60, riskCategory: 'High', population: 270000, vulnerabilityIndex: 0.52, vulnerability: 0.52, elderlyPercent: 14, outdoorWorkerPercent: 26, childrenPercent: 14, greenCoverPercent: 10, avgBuildingAge: 25, temperature: 36.2, humidity: 44, heatIndex: 39.7, wbgtEstimate: 29.3, factors: ['Dense population', 'High outdoor laborer presence', 'Industrial boundary exposure'], isSimulated: true },
];

// --- Cooling Centers ---
export const mockCoolingCenters = [
  { id: 'cc-001', name: 'Savitribai Phule Pune University Hall', address: 'Ganeshkhind Rd, Aundh, Pune 411007', lat: 18.5529, lng: 73.8260, location: { lat: 18.5529, lng: 73.8260 }, facilities: ['AC Hall', 'Drinking Water', 'First Aid', 'Restrooms', 'Seating Area'], capacity: 200, currentOccupancy: 45, isOpen: true, isActive: true, openHours: '9:00 AM - 8:00 PM', operatingHours: '9:00 AM - 8:00 PM', contact: '+91-20-25601234', contactNumber: '+91-20-25601234', isSimulated: true },
  { id: 'cc-002', name: 'Pune Municipal Corporation Community Hall - Kothrud', address: 'Paud Road, Kothrud, Pune 411038', lat: 18.5074, lng: 73.8120, location: { lat: 18.5074, lng: 73.8120 }, facilities: ['AC Hall', 'Drinking Water', 'First Aid', 'ORS Packets'], capacity: 150, currentOccupancy: 32, isOpen: true, isActive: true, openHours: '8:00 AM - 9:00 PM', operatingHours: '8:00 AM - 9:00 PM', contact: '+91-20-25431234', contactNumber: '+91-20-25431234', isSimulated: true },
  { id: 'cc-003', name: 'Nehru Memorial Hall', address: '1246 Tilak Rd, Sadashiv Peth, Pune 411030', lat: 18.5120, lng: 73.8450, location: { lat: 18.5120, lng: 73.8450 }, facilities: ['AC Hall', 'Drinking Water', 'First Aid', 'Restrooms', 'Medical Station', 'Seating Area'], capacity: 500, currentOccupancy: 120, isOpen: true, isActive: true, openHours: '7:00 AM - 10:00 PM', operatingHours: '7:00 AM - 10:00 PM', contact: '+91-20-24335678', contactNumber: '+91-20-24335678', isSimulated: true },
  { id: 'cc-004', name: 'Balewadi Sports Complex', address: 'Balewadi High St, Balewadi, Pune 411045', lat: 18.5738, lng: 73.7690, location: { lat: 18.5738, lng: 73.7690 }, facilities: ['AC Hall', 'Drinking Water', 'First Aid', 'Restrooms', 'Food Supplies', 'Parking'], capacity: 800, currentOccupancy: 180, isOpen: true, isActive: true, openHours: '6:00 AM - 10:00 PM', operatingHours: '6:00 AM - 10:00 PM', contact: '+91-20-27202345', contactNumber: '+91-20-27202345', isSimulated: true },
  { id: 'cc-005', name: 'Hadapsar Community Center', address: 'Magarpatta City Rd, Hadapsar, Pune 411028', lat: 18.5050, lng: 73.9300, location: { lat: 18.5050, lng: 73.9300 }, facilities: ['AC Hall', 'Drinking Water', 'Restrooms', 'First Aid'], capacity: 120, currentOccupancy: 28, isOpen: true, isActive: true, openHours: '9:00 AM - 7:00 PM', operatingHours: '9:00 AM - 7:00 PM', contact: '+91-20-26831234', contactNumber: '+91-20-26831234', isSimulated: true },
  { id: 'cc-006', name: 'Yerwada Public Library & Cool Room', address: 'Nagar Rd, Yerwada, Pune 411006', lat: 18.5560, lng: 73.8900, location: { lat: 18.5560, lng: 73.8900 }, facilities: ['AC Hall', 'Drinking Water', 'Reading Room', 'Fans', 'First Aid'], capacity: 80, currentOccupancy: 22, isOpen: true, isActive: true, openHours: '8:00 AM - 6:00 PM', operatingHours: '8:00 AM - 6:00 PM', contact: '+91-20-26631234', contactNumber: '+91-20-26631234', isSimulated: true },
  { id: 'cc-007', name: 'Sinhagad Road Community Hall', address: 'Sinhagad Rd, Vadgaon Budruk, Pune 411041', lat: 18.4710, lng: 73.8260, location: { lat: 18.4710, lng: 73.8260 }, facilities: ['AC Hall', 'Drinking Water', 'First Aid', 'Restrooms', 'Fans'], capacity: 180, currentOccupancy: 40, isOpen: true, isActive: true, openHours: '8:00 AM - 8:00 PM', operatingHours: '8:00 AM - 8:00 PM', contact: '+91-20-24351234', contactNumber: '+91-20-24351234', isSimulated: true },
  { id: 'cc-008', name: 'Viman Nagar Relief Shelter', address: 'Dhanori Rd, Viman Nagar, Pune 411014', lat: 18.5680, lng: 73.9100, location: { lat: 18.5680, lng: 73.9100 }, facilities: ['AC Hall', 'Drinking Water', 'First Aid', 'Medical Station', 'Food Supplies', 'IV Fluids'], capacity: 250, currentOccupancy: 65, isOpen: true, isActive: true, openHours: '24 Hours', operatingHours: '24 Hours', contact: '+91-20-26630000', contactNumber: '+91-20-26630000', isSimulated: true },
];

// --- Predictions ---
export const mockPredictions = Array.from({ length: 5 }, (_, i) => {
  const date = new Date(now.getTime() + i * 86400000);
  const baseTemp = 36 + i * 0.8;
  const thermalStress = Math.min(100, (baseTemp - 25) * 3 + 10);

  let riskCategory = 'Low';
  if (thermalStress > 75) riskCategory = 'Extreme';
  else if (thermalStress > 60) riskCategory = 'Very High';
  else if (thermalStress > 45) riskCategory = 'High';
  else if (thermalStress > 30) riskCategory = 'Moderate';

  return {
    date: formatDay(i),
    dayName: dayNames[date.getDay()],
    predictedTempMax: parseFloat(baseTemp.toFixed(1)),
    predictedTempMin: parseFloat((baseTemp - 12).toFixed(1)),
    predictedHeatIndex: parseFloat((baseTemp + 3).toFixed(1)),
    thermalStressIndex: parseFloat(thermalStress.toFixed(1)),
    riskCategory,
    confidence: 0.72 - i * 0.05,
    predictionMethod: 'Rule-based estimate',
    isSimulated: true,
  };
});

// --- Safe Hours ---
export const mockSafeHours = Array.from({ length: 24 }, (_, hour) => {
  let safetyRating, category, color, recommendation;

  if (hour >= 5 && hour <= 7) {
    safetyRating = 90; category = 'Safe'; color = 'green';
    recommendation = 'Excellent time for outdoor activity, exercise, and commuting.';
  } else if (hour >= 8 && hour <= 9) {
    safetyRating = 75; category = 'Caution'; color = 'yellow';
    recommendation = 'Moderate conditions. Stay hydrated if outdoors.';
  } else if (hour >= 10 && hour <= 10) {
    safetyRating = 55; category = 'Caution'; color = 'yellow';
    recommendation = 'Rising temperatures. Limit strenuous outdoor activity.';
  } else if (hour >= 11 && hour <= 15) {
    safetyRating = 15; category = 'Dangerous'; color = 'red';
    recommendation = 'Peak heat hours. Avoid outdoor exposure. Seek shade or AC.';
  } else if (hour >= 16 && hour <= 16) {
    safetyRating = 30; category = 'Avoid'; color = 'orange';
    recommendation = 'Still very hot. Minimize outdoor time.';
  } else if (hour >= 17 && hour <= 18) {
    safetyRating = 60; category = 'Caution'; color = 'yellow';
    recommendation = 'Temperatures declining. Short outdoor activities acceptable.';
  } else if (hour >= 19 && hour <= 21) {
    safetyRating = 85; category = 'Safe'; color = 'green';
    recommendation = 'Good conditions for evening activities and walks.';
  } else if (hour >= 22 || hour <= 4) {
    safetyRating = 95; category = 'Safe'; color = 'green';
    recommendation = 'Cool nighttime conditions. Safe for outdoor presence.';
  } else {
    safetyRating = 50; category = 'Caution'; color = 'yellow';
    recommendation = 'Moderate conditions. Stay aware of heat.';
  }

  return {
    hour,
    label: `${hour.toString().padStart(2, '0')}:00`,
    safetyRating,
    category,
    color,
    temperature: parseFloat((24 + 12 * Math.sin(((hour - 6) / 24) * Math.PI * 2 - Math.PI / 2)).toFixed(1)),
    recommendation,
    isSimulated: true,
  };
});

// --- Thermal Stress Breakdown ---
export const mockThermalStress = {
  overallIndex: 52,
  riskCategory: 'High',
  components: {
    temperature: { value: 35, contribution: 35, unit: '°C', label: 'Air Temperature' },
    humidity: { value: 45, contribution: 20, unit: '%', label: 'Relative Humidity' },
    solarRadiation: { value: 750, contribution: 25, unit: 'W/m²', label: 'Solar Radiation' },
    windSpeed: { value: 12, contribution: -10, unit: 'km/h', label: 'Wind Speed (cooling)' },
    urbanHeatIsland: { value: 2.5, contribution: 8, unit: '°C', label: 'Urban Heat Island Effect' },
  },
  wbgtEstimate: 28,
  heatIndex: 38,
  methodology: 'Thermal stress index computed using weighted combination of temperature, humidity, solar radiation, wind speed, and estimated urban heat island effect. WBGT is estimated from available parameters — actual WBGT requires wet-bulb thermometer measurements.',
  thresholds: [
    { level: 'Low', range: '0-30', description: 'Normal conditions, no special precautions needed.' },
    { level: 'Moderate', range: '30-45', description: 'Caution advised for prolonged outdoor activity.' },
    { level: 'High', range: '45-60', description: 'Reduce outdoor exertion. Hydrate frequently.' },
    { level: 'Very High', range: '60-75', description: 'Limit outdoor exposure. High risk for vulnerable groups.' },
    { level: 'Extreme', range: '75-100', description: 'Danger. Avoid all unnecessary outdoor activity.' },
  ],
  isSimulated: true,
};

export default {
  mockCurrentWeather,
  mockForecast,
  mockDailyForecast,
  mockAlerts,
  mockWards,
  mockCoolingCenters,
  mockPredictions,
  mockSafeHours,
  mockThermalStress,
};
