/**
 * Dealcraft Central Monetization & Lead Generation Configuration
 * 
 * Customize these values to change the destination URLs and tracking parameters
 * for your language school (www.englishbreakfast.pl) and donation links.
 */

export const MONETIZATION_CONFIG = {
  // Primary Lead Generation target: Your language school URL
  ENGLISH_BREAKFAST_URL: 'https://www.englishbreakfast.pl',

  // Donation target: Buy Me a Coffee, Patreon, or Stripe support page
  BUY_ME_A_COFFEE_URL: 'https://buymeacoffee.com/yourprofile', // Replace with your actual profile link!

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
 * Builds the Buy Me a Coffee link with optional tracking or message.
 */
export function getBuyMeACoffeeLink(): string {
  return MONETIZATION_CONFIG.BUY_ME_A_COFFEE_URL;
}
