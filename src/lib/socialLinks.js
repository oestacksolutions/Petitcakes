export function openInstagramProfile(e, username) {
  const cleanUser = String(username || '').replace(/^@/, '').trim();
  const webUrl = `https://www.instagram.com/${cleanUser}/`;

  if (typeof navigator === 'undefined') return;

  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  if (!isAndroid && !isIOS) {
    return;
  }

  e.preventDefault();

  if (isAndroid) {
    const intentUrl = `intent://instagram.com/_u/${cleanUser}/#Intent;package=com.instagram.android;scheme=https;S.browser_fallback_url=${encodeURIComponent(webUrl)};end`;
    window.location.href = intentUrl;
    return;
  }

  if (isIOS) {
    const appUrl = `instagram://user?username=${cleanUser}`;
    const start = Date.now();
    window.location.href = appUrl;

    setTimeout(() => {
      if (Date.now() - start < 2000) {
        window.location.href = webUrl;
      }
    }, 1200);
  }
}