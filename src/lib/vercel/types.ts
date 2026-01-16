/**
 * Vercel Web Analytics Event Types
 *
 * @see https://vercel.com/docs/drains/reference/analytics
 */

/**
 * Raw event from Vercel Web Analytics Drain
 * All fields are optional as Vercel may not include all fields in every event
 */
export interface VercelAnalyticsEvent {
  /** Schema version identifier */
  schema?: string;

  /** Type of analytics event: "pageview" or "event" */
  eventType?: string;

  /** Name of the custom event (for eventType: "event") */
  eventName?: string;

  /** Additional data associated with the event (JSON string) */
  eventData?: string;

  /** Unix timestamp when the event was recorded (milliseconds) */
  timestamp?: number;

  /** Identifier for the Vercel project */
  projectId?: string;

  /** Identifier for the project owner */
  ownerId?: string;

  /** Name of the data source */
  dataSourceName?: string;

  /** Unique session identifier */
  sessionId?: number;

  /** Unique device identifier */
  deviceId?: number;

  /** Origin URL where the event was recorded */
  origin?: string;

  /** URL path where the event was recorded */
  path?: string;

  /** Referrer URL */
  referrer?: string;

  /** Query parameters from the URL */
  queryParams?: string;

  /** Route pattern for the page */
  route?: string;

  /** Country code of the user */
  country?: string;

  /** Region code of the user */
  region?: string;

  /** City of the user */
  city?: string;

  /** Operating system name */
  osName?: string;

  /** Operating system version */
  osVersion?: string;

  /** Client browser name */
  clientName?: string;

  /** Type of client */
  clientType?: string;

  /** Client browser version */
  clientVersion?: string;

  /** Type of device */
  deviceType?: string;

  /** Device brand */
  deviceBrand?: string;

  /** Device model */
  deviceModel?: string;

  /** Browser engine name */
  browserEngine?: string;

  /** Browser engine version */
  browserEngineVersion?: string;

  /** SDK version used to track events */
  sdkVersion?: string;

  /** SDK name used to track events */
  sdkName?: string;

  /** Full SDK version string */
  sdkVersionFull?: string;

  /** Vercel environment */
  vercelEnvironment?: string;

  /** Vercel deployment URL */
  vercelUrl?: string;

  /** Feature flags information */
  flags?: string;

  /** Identifier for the Vercel deployment */
  deployment?: string;
}

/**
 * Response from the analytics ingest endpoint
 */
export interface AnalyticsIngestResponse {
  success: boolean;
  count?: number;
  ms?: number;
  error?: string;
}
