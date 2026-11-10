/**
 * wardService.js — Pune ward data and ward-level risk calculations.
 *
 * ⚠️  IMPORTANT NOTE ON GEOGRAPHIC DATA:
 *     This file provides approximate centre-point coordinates for each ward.
 *     It does NOT include ward boundary polygons (GeoJSON).
 *     Proper ward boundary GeoJSON data should be sourced from:
 *       - Pune Municipal Corporation (PMC) open data portal
 *       - Survey of India / DataMeet community datasets
 *       - Verified geographic data providers
 *     Do NOT fabricate or approximate ward boundary polygons.
 *
 * Each ward has three vulnerability factors (0.0 – 1.0):
 *   - populationDensityFactor : higher = more people at risk
 *   - greenCoverFactor        : higher = more green cover = lower vulnerability
 *   - urbanizationFactor      : higher = more concrete / urban heat island effect
 */

const PUNE_WARDS = [
  {
    name: 'Aundh-Baner',
    center: { lat: 18.5590, lng: 73.8077 },
    population: 285000,
    populationDensityFactor: 0.7,
    greenCoverFactor: 0.4,
    urbanizationFactor: 0.8,
    elderlyPercent: 11,
    outdoorWorkerPercent: 18,
    childrenPercent: 14,
    greenCoverPercent: 22,
    avgBuildingAge: 15,
    keyDrivers: ['Moderate building density', 'Active IT corridor', 'Riverfront thermal microclimate'],
  },
  {
    name: 'Kothrud-Bavdhan',
    center: { lat: 18.5074, lng: 73.8077 },
    population: 310000,
    populationDensityFactor: 0.65,
    greenCoverFactor: 0.5,
    urbanizationFactor: 0.7,
    elderlyPercent: 13,
    outdoorWorkerPercent: 15,
    childrenPercent: 16,
    greenCoverPercent: 20,
    avgBuildingAge: 20,
    keyDrivers: ['High residential density', 'Foothill topography', 'Aging concrete infrastructure'],
  },
  {
    name: 'Warje-Karvenagar',
    center: { lat: 18.4868, lng: 73.8188 },
    population: 195000,
    populationDensityFactor: 0.6,
    greenCoverFactor: 0.45,
    urbanizationFactor: 0.7,
    elderlyPercent: 9,
    outdoorWorkerPercent: 20,
    childrenPercent: 17,
    greenCoverPercent: 18,
    avgBuildingAge: 12,
    keyDrivers: ['Rapid residential expansion', 'Mutha river proximity', 'Growing concrete footprint'],
  },
  {
    name: 'Dhankawadi-Sahakarnagar',
    center: { lat: 18.4620, lng: 73.8510 },
    population: 175000,
    populationDensityFactor: 0.55,
    greenCoverFactor: 0.5,
    urbanizationFactor: 0.6,
    elderlyPercent: 12,
    outdoorWorkerPercent: 22,
    childrenPercent: 16,
    greenCoverPercent: 16,
    avgBuildingAge: 18,
    keyDrivers: ['Mixed commercial-residential', 'Katraj hill breeze corridor'],
  },
  {
    name: 'Bibwewadi-Kondhwa',
    center: { lat: 18.4750, lng: 73.8700 },
    population: 240000,
    populationDensityFactor: 0.7,
    greenCoverFactor: 0.35,
    urbanizationFactor: 0.75,
    elderlyPercent: 10,
    outdoorWorkerPercent: 24,
    childrenPercent: 18,
    greenCoverPercent: 14,
    avgBuildingAge: 14,
    keyDrivers: ['High population density', 'Commercial transit routes', 'Limited shade structures'],
  },
  {
    name: 'Hadapsar-Mundhwa',
    center: { lat: 18.5089, lng: 73.9260 },
    population: 420000,
    populationDensityFactor: 0.8,
    greenCoverFactor: 0.3,
    urbanizationFactor: 0.85,
    elderlyPercent: 10,
    outdoorWorkerPercent: 26,
    childrenPercent: 18,
    greenCoverPercent: 12,
    avgBuildingAge: 12,
    keyDrivers: ['Industrial and IT zones', 'High outdoor workforce exposure', 'High thermal absorption'],
  },
  {
    name: 'Wanawadi-Ramtekdi',
    center: { lat: 18.4980, lng: 73.8930 },
    population: 210000,
    populationDensityFactor: 0.75,
    greenCoverFactor: 0.25,
    urbanizationFactor: 0.8,
    elderlyPercent: 12,
    outdoorWorkerPercent: 28,
    childrenPercent: 15,
    greenCoverPercent: 11,
    avgBuildingAge: 22,
    keyDrivers: ['Dense transit intersections', 'Low canopy cover', 'Industrial boundary exposure'],
  },
  {
    name: 'Kasba-Vishrambaug',
    center: { lat: 18.5130, lng: 73.8560 },
    population: 150000,
    populationDensityFactor: 0.85,
    greenCoverFactor: 0.2,
    urbanizationFactor: 0.9,
    elderlyPercent: 18,
    outdoorWorkerPercent: 30,
    childrenPercent: 12,
    greenCoverPercent: 5,
    avgBuildingAge: 48,
    keyDrivers: ['Core historic core with narrow lanes', 'Severe Urban Heat Island effect', 'Highest elderly demographic'],
  },
  {
    name: 'Shivajinagar-Ghole Road',
    center: { lat: 18.5308, lng: 73.8475 },
    population: 230000,
    populationDensityFactor: 0.8,
    greenCoverFactor: 0.3,
    urbanizationFactor: 0.85,
    elderlyPercent: 14,
    outdoorWorkerPercent: 21,
    childrenPercent: 14,
    greenCoverPercent: 15,
    avgBuildingAge: 30,
    keyDrivers: ['Administrative hub', 'High vehicular heat dissipation', 'Paved ground dominance'],
  },
  {
    name: 'Khadki-Kirkee',
    center: { lat: 18.5580, lng: 73.8453 },
    population: 130000,
    populationDensityFactor: 0.5,
    greenCoverFactor: 0.6,
    urbanizationFactor: 0.5,
    elderlyPercent: 12,
    outdoorWorkerPercent: 16,
    childrenPercent: 14,
    greenCoverPercent: 32,
    avgBuildingAge: 35,
    keyDrivers: ['Cantonment open spaces', 'Significant tree canopy buffer', 'Moderate heat accumulation'],
  },
  {
    name: 'Yerawada',
    center: { lat: 18.5580, lng: 73.8860 },
    population: 270000,
    populationDensityFactor: 0.65,
    greenCoverFactor: 0.35,
    urbanizationFactor: 0.7,
    elderlyPercent: 14,
    outdoorWorkerPercent: 25,
    childrenPercent: 15,
    greenCoverPercent: 13,
    avgBuildingAge: 25,
    keyDrivers: ['Mixed industrial-residential', 'High informal settlement vulnerability', 'Mula river microclimate'],
  },
  {
    name: 'Nagar Road-Wadgaon Sheri',
    center: { lat: 18.5620, lng: 73.9190 },
    population: 280000,
    populationDensityFactor: 0.7,
    greenCoverFactor: 0.3,
    urbanizationFactor: 0.8,
    elderlyPercent: 9,
    outdoorWorkerPercent: 23,
    childrenPercent: 17,
    greenCoverPercent: 12,
    avgBuildingAge: 14,
    keyDrivers: ['Airport highway corridor', 'Extensive asphalt coverage', 'Commercial high-rises'],
  },
  {
    name: 'Sangamwadi',
    center: { lat: 18.5370, lng: 73.8650 },
    population: 160000,
    populationDensityFactor: 0.6,
    greenCoverFactor: 0.4,
    urbanizationFactor: 0.65,
    elderlyPercent: 13,
    outdoorWorkerPercent: 22,
    childrenPercent: 15,
    greenCoverPercent: 18,
    avgBuildingAge: 26,
    keyDrivers: ['River confluence basin', 'Transit hub congestion', 'Elevated daytime humidity'],
  },
  {
    name: 'Dhole Patil Road',
    center: { lat: 18.5270, lng: 73.8780 },
    population: 185000,
    populationDensityFactor: 0.75,
    greenCoverFactor: 0.25,
    urbanizationFactor: 0.85,
    elderlyPercent: 15,
    outdoorWorkerPercent: 24,
    childrenPercent: 13,
    greenCoverPercent: 10,
    avgBuildingAge: 28,
    keyDrivers: ['Railway station perimeter', 'Dense commercial hotels and offices', 'High waste-heat emissions'],
  },
  {
    name: 'Kondhwa-Yewalewadi',
    center: { lat: 18.4580, lng: 73.8820 },
    population: 225000,
    populationDensityFactor: 0.55,
    greenCoverFactor: 0.45,
    urbanizationFactor: 0.6,
    elderlyPercent: 8,
    outdoorWorkerPercent: 21,
    childrenPercent: 19,
    greenCoverPercent: 20,
    avgBuildingAge: 9,
    keyDrivers: ['Rapidly urbanizing fringe', 'Construction site heat plumes', 'Developing drainage corridors'],
  },
];

/**
 * Calculate a ward-level risk score by combining the city-wide thermal stress
 * index with ward-specific vulnerability factors.
 *
 * Formula:
 *   vulnerabilityScore = (populationDensityFactor × 0.35)
 *                      + ((1 - greenCoverFactor) × 0.30)
 *                      + (urbanizationFactor × 0.35)
 *
 *   wardRisk = thermalStressIndex × (0.6 + 0.4 × vulnerabilityScore)
 *
 * The vulnerability score modulates the city-wide thermal stress by up to ±40%.
 * A ward with high population density, low green cover, and high urbanization
 * will see a higher risk score than the city average.
 *
 * @param {number} thermalStressIndex — city-wide thermal stress (0–100)
 * @param {Object} ward               — ward object from PUNE_WARDS
 * @returns {{ wardName: string, riskScore: number, riskCategory: string, vulnerability: number }}
 */
function calculateWardRisk(thermalStressIndex, ward, weather = {}) {
  const vulnerability =
    ward.populationDensityFactor * 0.35 +
    (1 - ward.greenCoverFactor) * 0.30 +
    ward.urbanizationFactor * 0.35;

  // Effective thermal stress input (if 0 or undefined, default to 52 for reasonable baseline)
  const baseTsi = thermalStressIndex > 0 ? thermalStressIndex : 50;

  // Scale thermal stress by vulnerability (baseline 60% weather, 40% local factors)
  let riskScore = baseTsi * (0.6 + 0.4 * vulnerability);
  riskScore = Math.min(100, Math.max(0, Math.round(riskScore * 10) / 10));

  let riskCategory;
  if (riskScore >= 80) riskCategory = 'Extreme';
  else if (riskScore >= 65) riskCategory = 'Very High';
  else if (riskScore >= 50) riskCategory = 'High';
  else if (riskScore >= 35) riskCategory = 'Moderate';
  else riskCategory = 'Low';

  // Microclimate adjustments based on urbanization & green canopy cover
  const baseTemp = weather.temperature ?? 35.0;
  const baseHumidity = weather.humidity ?? 45.0;
  const uhiEffect = (ward.urbanizationFactor - ward.greenCoverFactor) * 2.2;
  const wardTemp = Math.round((baseTemp + uhiEffect) * 10) / 10;
  const wardHumidity = Math.max(20, Math.min(90, Math.round(baseHumidity - (uhiEffect * 1.5))));
  const wardHeatIndex = Math.round((wardTemp + (wardHumidity / 100) * 5) * 10) / 10;
  const wardWbgt = Math.round((0.7 * (wardTemp * 0.8) + 0.3 * wardTemp) * 10) / 10;

  return {
    name: ward.name,
    wardName: ward.name,
    lat: ward.center.lat,
    lng: ward.center.lng,
    center: ward.center,
    riskScore,
    ward_tsi: riskScore,
    riskCategory,
    vulnerability: Math.round(vulnerability * 100) / 100,
    vulnerabilityIndex: Math.round(vulnerability * 100) / 100,
    population: ward.population,
    elderlyPercent: ward.elderlyPercent,
    outdoorWorkerPercent: ward.outdoorWorkerPercent,
    childrenPercent: ward.childrenPercent,
    greenCoverPercent: ward.greenCoverPercent,
    avgBuildingAge: ward.avgBuildingAge,
    temperature: wardTemp,
    humidity: wardHumidity,
    heatIndex: wardHeatIndex,
    wbgtEstimate: wardWbgt,
    factors: ward.keyDrivers || [
      `Urbanization index ${(ward.urbanizationFactor * 100).toFixed(0)}%`,
      `Green canopy ${(ward.greenCoverFactor * 100).toFixed(0)}%`,
      `Population density exposure ${(ward.populationDensityFactor * 100).toFixed(0)}%`
    ],
    factorBreakdown: {
      populationDensity: ward.populationDensityFactor,
      greenCover: ward.greenCoverFactor,
      urbanization: ward.urbanizationFactor,
    },
    hasCertifiedCentroid: true,
    isSimulated: false,
  };
}

/**
 * Calculate risk for ALL Pune wards given the current city-wide thermal stress.
 *
 * @param {number} thermalStressIndex
 * @param {Object} [weather]
 * @returns {Array<Object>}
 */
function calculateAllWardRisks(thermalStressIndex, weather = {}) {
  return PUNE_WARDS.map((ward) => calculateWardRisk(thermalStressIndex, ward, weather));
}

/**
 * Get a specific ward by name (case-insensitive partial match).
 *
 * @param {string} name
 * @returns {Object|null}
 */
function getWardByName(name) {
  const lower = name.toLowerCase();
  return PUNE_WARDS.find((w) => w.name.toLowerCase().includes(lower)) || null;
}

module.exports = {
  PUNE_WARDS,
  calculateWardRisk,
  calculateAllWardRisks,
  getWardByName,
};
