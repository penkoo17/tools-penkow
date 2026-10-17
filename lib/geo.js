export async function enrichIp(ip) {
  if (!ip) return null;
  try {
    const r = await fetch(`https://ipapi.co/${ip}/json/`);
    const g = await r.json();
    return {
      city: g.city,
      region: g.region,
      country: g.country_name,
      lat: g.latitude,
      lng: g.longitude,
      isp: g.org,
      postal: g.postal
    };
  } catch (e) {
    return null;
  }
}