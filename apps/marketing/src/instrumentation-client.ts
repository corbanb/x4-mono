import posthog from 'posthog-js';

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

// Analytics is optional — the site renders fine without a key configured.
if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    defaults: '2026-06-25',
    // App Router navigations are client-side, so pageviews come from history changes
    // rather than full page loads.
    capture_pageview: 'history_change',
  });
}
