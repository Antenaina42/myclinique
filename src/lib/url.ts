import type { NextRequest } from 'next/server';

/**
 * Construit une URL de redirection sécurisée qui évite les adresses internes de reverse-proxy
 * (comme 0.0.0.0:3000 ou les IP internes de conteneurs Node.js)
 * et utilise en priorité les en-têtes publics (x-forwarded-host, host, referer, origin).
 */
export function getSafeRedirectUrl(pathname: string, request: NextRequest): URL {
  // 1. Essayer d'extraire l'origine depuis Referer (très précis sur les soumissions de formulaires)
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.hostname !== '0.0.0.0') {
        return new URL(pathname, refererUrl.origin);
      }
    } catch {}
  }

  // 2. Essayer depuis Origin
  const origin = request.headers.get('origin');
  if (origin && !origin.includes('0.0.0.0')) {
    try {
      return new URL(pathname, origin);
    } catch {}
  }

  // 3. Essayer depuis X-Forwarded-Host et X-Forwarded-Proto
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  if (forwardedHost && !forwardedHost.includes('0.0.0.0')) {
    return new URL(pathname, `${forwardedProto}://${forwardedHost}`);
  }

  // 4. Essayer depuis Host
  const host = request.headers.get('host');
  if (host && !host.includes('0.0.0.0')) {
    const proto = request.headers.get('x-forwarded-proto') || (request.url.startsWith('https') ? 'https' : 'http');
    return new URL(pathname, `${proto}://${host}`);
  }

  // 5. Utiliser request.url en nettoyant 0.0.0.0 si présent
  const url = new URL(pathname, request.url);
  if (url.hostname === '0.0.0.0') {
    url.hostname = 'myclinique.m-itlevelup.com';
    url.protocol = 'https:';
    url.port = '';
  }
  return url;
}
