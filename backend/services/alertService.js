/**
 * alertService.js — Generates weather-based heat alerts for Pune.
 *
 * Thermal Stress Index thresholds (0–100 scale):
 *   > 80  → Extreme        → extreme-heat-emergency
 *   > 65  → Very High      → heat-warning
 *   > 50  → High           → heat-warning (lower tier)
 *   > 35  → Moderate       → heat-advisory
 *   ≤ 35  → Low            → no alert generated
 */

const Alert = require('../models/Alert');

/**
 * Pre-defined recommendations by severity tier.
 * These are public-health best-practice suggestions, not medical advice.
 */
const RECOMMENDATIONS = {
  moderate: [
    'Stay hydrated — drink water regularly even if not thirsty.',
    'Limit strenuous outdoor activity during 11 AM – 4 PM.',
    'Wear light-coloured, loose-fitting clothing.',
    'Check on elderly neighbours and family members.',
  ],
  high: [
    'Avoid outdoor work between 11 AM and 5 PM if possible.',
    'Move to air-conditioned or shaded areas during peak heat.',
    'Use ORS (oral rehydration salts) if experiencing excessive sweating.',
    'Never leave children or pets in parked vehicles.',
    'Watch for signs of heat exhaustion: heavy sweating, weakness, nausea.',
  ],
  'very-high': [
    'AVOID all non-essential outdoor activity during daylight hours.',
    'Seek air-conditioned cooling centres immediately if you feel unwell.',
    'Drink at least 3–4 litres of water throughout the day.',
    'Apply wet towels to neck, wrists, and forehead to lower body temperature.',
    'Contact emergency services (112) if you see someone showing signs of heatstroke.',
    'Employers should reschedule outdoor labour to early morning or evening.',
  ],
  extreme: [
    '🚨 EMERGENCY: Stay indoors in cooled spaces at all times.',
    'If you must go outside, limit exposure to under 15 minutes.',
    'Call 112 immediately if anyone shows confusion, hot dry skin, or loss of consciousness.',
    'All outdoor construction and labour should be suspended.',
    'Schools and outdoor events should be cancelled.',
    'Visit the nearest cooling centre — check the HeatGuard app for locations.',
    'Keep emergency water supplies ready.',
  ],
};

/**
 * Generate alerts based on current weather / thermal stress data.
 *
 * @param {Object} weatherData — enriched weather object from weatherService
 * @param {Object} options
 * @param {boolean} options.isSimulated — mark generated alerts as simulated/demo
 * @returns {Array<Object>} — array of alert objects (not yet saved to DB)
 */
function generateAlerts(weatherData, { isSimulated = false } = {}) {
  const alerts = [];
  const tsi = weatherData.thermalStressIndex;

  if (tsi == null || tsi <= 35) {
    // No alert needed
    return alerts;
  }

  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now
  const temp = weatherData.temperature != null ? `${weatherData.temperature}°C` : 'N/A';
  const hi = weatherData.heatIndex != null ? `${weatherData.heatIndex}°C` : 'N/A';

  if (tsi > 80) {
    alerts.push({
      type: 'extreme-heat-emergency',
      severity: 'extreme',
      title: '🚨 Extreme Heat Emergency — Pune',
      description:
        `Thermal Stress Index has reached ${tsi}/100. ` +
        `Current temperature: ${temp}, Heat Index: ${hi}. ` +
        'Life-threatening conditions. All residents should stay indoors in cooled spaces.',
      affectedWards: ['All Wards'],
      recommendations: RECOMMENDATIONS.extreme,
      isActive: true,
      isSimulated,
      createdAt: new Date(),
      expiresAt,
    });
  } else if (tsi > 65) {
    alerts.push({
      type: 'heat-warning',
      severity: 'very-high',
      title: '⚠️ Severe Heat Warning — Pune',
      description:
        `Thermal Stress Index is ${tsi}/100. ` +
        `Current temperature: ${temp}, Heat Index: ${hi}. ` +
        'Dangerous heat conditions expected. Avoid outdoor exposure.',
      affectedWards: ['All Wards'],
      recommendations: RECOMMENDATIONS['very-high'],
      isActive: true,
      isSimulated,
      createdAt: new Date(),
      expiresAt,
    });
  } else if (tsi > 50) {
    alerts.push({
      type: 'heat-warning',
      severity: 'high',
      title: '🔶 Heat Warning — Pune',
      description:
        `Thermal Stress Index is ${tsi}/100. ` +
        `Current temperature: ${temp}, Heat Index: ${hi}. ` +
        'High heat stress expected. Limit outdoor activity during peak hours.',
      affectedWards: ['All Wards'],
      recommendations: RECOMMENDATIONS.high,
      isActive: true,
      isSimulated,
      createdAt: new Date(),
      expiresAt,
    });
  } else {
    // tsi > 35
    alerts.push({
      type: 'heat-advisory',
      severity: 'moderate',
      title: '🟡 Heat Advisory — Pune',
      description:
        `Thermal Stress Index is ${tsi}/100. ` +
        `Current temperature: ${temp}, Heat Index: ${hi}. ` +
        'Moderate heat stress. Take precautions if spending time outdoors.',
      affectedWards: ['All Wards'],
      recommendations: RECOMMENDATIONS.moderate,
      isActive: true,
      isSimulated,
      createdAt: new Date(),
      expiresAt,
    });
  }

  return alerts;
}

/**
 * Generate alerts and persist them to MongoDB.
 *
 * @param {Object} weatherData — enriched weather data
 * @param {Object} options
 * @returns {Array<Object>} — saved alert documents
 */
async function generateAndSaveAlerts(weatherData, options = {}) {
  const alertDefs = generateAlerts(weatherData, options);

  if (alertDefs.length === 0) return [];

  // Deactivate previous alerts before creating new ones
  await Alert.updateMany({ isActive: true }, { isActive: false });

  const saved = await Alert.insertMany(alertDefs);
  return saved;
}

module.exports = {
  generateAlerts,
  generateAndSaveAlerts,
  RECOMMENDATIONS,
};
