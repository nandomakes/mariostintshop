export const ADS_PHONE_FLAG: 'on';
export const ADS_CONVERSION_ID: string;
export const ADS_PHONE_SEND_TO: string;
export const ADS_PHONE_DISPLAY: string;
export const ADS_PHONE_DIGITS: string;

export interface AdsPhoneConfig {
  conversionId: string;
  sendTo: string;
  displayNumber: string;
  businessDigits: string;
}

export interface ForwardingResult {
  textNodes: number;
  telLinks: number;
  ariaLabels: number;
}

export function adsPhoneConversionEnabled(flag: string | undefined): boolean;
export function resolveAdsPhoneConfig(flag: string | undefined): AdsPhoneConfig | null;
export function assertAdsPhoneConfig(config: AdsPhoneConfig): AdsPhoneConfig;
export function applyForwardingNumber(
  doc: Document,
  options: {
    formattedNumber: string;
    mobileNumber: string;
    displayNumber: string;
    businessDigits: string;
  },
): ForwardingResult;
export function renderAdsPhoneHeadScript(config: AdsPhoneConfig): string;
