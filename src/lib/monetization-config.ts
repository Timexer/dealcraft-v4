/**
 * Dealcraft Central Monetization & Lead Generation Configuration
 * 
 * Customize these values to change the destination URLs and tracking parameters
 * for your language school (www.englishbreakfast.pl) and payment links.
 */

export const MONETIZATION_CONFIG = {
  // Primary Lead Generation target: Your language school URL
  ENGLISH_BREAKFAST_URL: 'https://www.englishbreakfast.pl',

  // Lemon Squeezy Checkout URLs for supporting Dealcraft
  LEMON_SQUEEZY_URL: 'https://dealcraft-mastery.lemonsqueezy.com/checkout/buy/2504b165-7f75-4963-b5c1-65edcb7c6a43',

  // Tracking query parameters
  UTM_SOURCE: 'dealcraft',
  UTM_MEDIUM: 'game',
};

/**
 * Builds the English Breakfast link with performance-specific UTM tracking.
 * Helps you measure exactly which cases and performance levels drive the most leads!
 * 
 * @param grade The player's score grade (S/A/B/C/D/F)
 * @param scenarioId The active case scenario ID (e.g. 'case-01')
 */
export function getEnglishBreakfastLink(grade?: string, scenarioId?: string): string {
  const baseUrl = MONETIZATION_CONFIG.ENGLISH_BREAKFAST_URL;
  const utmSource = MONETIZATION_CONFIG.UTM_SOURCE;
  const utmMedium = MONETIZATION_CONFIG.UTM_MEDIUM;
  const utmCampaign = `dc_${scenarioId || 'general'}_${grade || 'no_grade'}`;
  
  return `${baseUrl}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;
}

/**
 * Builds the Lemon Squeezy payment link. Optionally appends embed query parameter.
 */
export function getLemonSqueezyLink(embed: boolean = true): string {
  const baseUrl = MONETIZATION_CONFIG.LEMON_SQUEEZY_URL;
  return embed ? `${baseUrl}?embed=1` : baseUrl;
}
