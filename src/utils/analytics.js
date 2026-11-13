/**
 * SPA page-view tracking for Google Tag Manager.
 * GTM reads these dataLayer events; the GA4 tag itself is configured in the GTM dashboard.
 */
export function trackPageView(pathname) {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];

  // One frame's delay so react-helmet-async has committed the new document.title.
  window.requestAnimationFrame(() => {
    window.dataLayer.push({
      event: 'page_view',
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  });
}
