export default function MapView({ lat, lng }) {
  if (!lat || !lng) return null;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <iframe
      src={src}
      style={{ width: '100%', height: 240, border: '1px solid #333', borderRadius: 8 }}
      title="Lokasi"
    />
  );
}