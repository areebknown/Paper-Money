/**
 * Cloudinary Image Registry — Single source of truth for all CDN image URLs.
 *
 * HOW TO ADD A NEW IMAGE:
 * 1. Upload the image to Cloudinary.
 * 2. Copy the version hash (e.g. v1771503836) from the Cloudinary URL in the dashboard.
 * 3. Add a new entry below with the full versioned URL.
 *
 * WHY version hashes matter:
 * Without a /vXXXXXXXXX/ segment, Cloudinary cannot instruct the browser to cache
 * the image indefinitely. With it, the browser saves the image locally forever
 * (until you upload a new version, which changes the hash).
 */

const CLD = 'https://res.cloudinary.com/dzsr4olmn/image/upload';

// ─── UI Assets ───────────────────────────────────────────────────────────────
export const LOGO_URL = `${CLD}/q_auto,f_auto/v1771503836/ui/bid-wars-logo`;

// ─── Shutter Backgrounds (auction tier cards) ────────────────────────────────
export const SHUTTER_URLS: Record<string, string> = {
    BRONZE: `${CLD}/q_auto:eco,f_auto,w_400/v1771503832/shutter/bronze`,
    SILVER: `${CLD}/q_auto:eco,f_auto,w_400/v1771503833/shutter/silver`,
    GOLD: `${CLD}/q_auto:eco,f_auto,w_400/v1771503835/shutter/gold`,
    DIAMOND: `${CLD}/q_auto:eco,f_auto,w_400/v1771586328/shutter/xm9krvefxp1kzg8e08dn`,
};

export const getTierBg = (tier: string): string =>
    SHUTTER_URLS[tier] ?? SHUTTER_URLS.BRONZE;

// ─── Market Category Backgrounds ─────────────────────────────────────────────
export const MARKET_BG_URLS: Record<string, string> = {
    invest: `${CLD}/q_auto:eco,f_auto,w_400/v1771503827/market-bg/invest`,
    pawn: `${CLD}/q_auto:eco,f_auto,w_400/v1771503828/market-bg/pawn`,
    dig: `${CLD}/q_auto:eco,f_auto,w_400/v1771503829/market-bg/dig`,
    consumer: `${CLD}/q_auto:eco,f_auto,w_400/v1771503831/market-bg/consumer`,
};
