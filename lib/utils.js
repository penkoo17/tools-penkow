export function getClientIp(headers, socket) {
  const xff = headers['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  return headers['x-real-ip'] || socket?.remoteAddress || null;
}

export function isValidUrl(str) {
  try { new URL(str); return true; } catch (_) { return false; }
}