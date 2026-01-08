/**
 * Google API Authentication
 * Creates authenticated clients for GA4 and Search Console
 */

import { google } from 'googleapis';

/**
 * Get authenticated Google client using service account credentials
 */
export function getGoogleAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !privateKey) {
    return null;
  }

  // Handle escaped newlines in the private key
  const formattedKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: formattedKey,
    },
    scopes: [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/webmasters.readonly',
    ],
  });

  return auth;
}

/**
 * Check if Google APIs are configured
 */
export function isGoogleConfigured(): {
  ga4: boolean;
  searchConsole: boolean;
} {
  return {
    ga4: !!(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_GA4_PROPERTY_ID
    ),
    searchConsole: !!(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_SEARCH_CONSOLE_SITE
    ),
  };
}
