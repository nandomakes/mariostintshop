// Build-time Instagram feed.
//
// To show the shop's real latest posts, this fetches the Instagram Graph API
// at build time using a long-lived access token. Because the site is static,
// the feed refreshes on each deploy (re-run the build to pull new posts).
//
// Set these in a local `.env` file (and in the Vercel project env):
//   INSTAGRAM_TOKEN=<long-lived access token>
//   INSTAGRAM_USER_ID=<numeric IG user id, optional — defaults to "me">
//
// A long-lived token is obtained once via the Instagram Basic Display /
// Instagram Login flow for the @mariostintshop professional account and lasts
// ~60 days (refreshable). Without a token, the site falls back to the curated
// GALLERY images in consts.ts, so the section never breaks.

import { GALLERY, INSTAGRAM } from '../consts';

export interface FeedItem {
  src: string;
  alt: string;
  href: string;
}

interface IgMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
}

const FALLBACK: FeedItem[] = GALLERY.map((g) => ({
  src: g.src,
  alt: g.alt,
  href: INSTAGRAM.url,
}));

export async function getInstagramFeed(limit = 8): Promise<FeedItem[]> {
  const token = import.meta.env.INSTAGRAM_TOKEN;
  if (!token) return FALLBACK;

  const userId = import.meta.env.INSTAGRAM_USER_ID || 'me';
  const fields = 'id,media_type,media_url,thumbnail_url,permalink,caption';
  const url = `https://graph.instagram.com/${userId}/media?fields=${fields}&limit=${limit}&access_token=${token}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[instagram] feed fetch failed (${res.status}); using fallback`);
      return FALLBACK;
    }
    const json = (await res.json()) as { data?: IgMedia[] };
    const items = (json.data ?? [])
      .map((m) => {
        const src = m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url;
        if (!src) return null;
        const caption = (m.caption ?? '').replace(/\s+/g, ' ').trim();
        return {
          src,
          alt: caption ? caption.slice(0, 120) : 'Instagram post from Mario\'s Tint Shop',
          href: m.permalink,
        } satisfies FeedItem;
      })
      .filter((x): x is FeedItem => x !== null);

    return items.length ? items : FALLBACK;
  } catch (err) {
    console.warn('[instagram] feed fetch errored; using fallback', err);
    return FALLBACK;
  }
}
