export default function LogTable({ logs = [] }) {
  if (!logs.length) return <p>Belum ada log.</p>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tipe</th>
            <th>IP / GPS</th>
            <th>Kota / Akurasi</th>
            <th>Negara</th>
            <th>Waktu</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l, i) => {
            // Prioritas: GPS Client -> IP Client -> IP Server
            const isGps = !!l.gps;
            const isClientGeo = !!l.clientIpGeo;
            const isServerGeo = !!l.ipGeo;

            const displayCoords = isGps 
              ? `${l.gps.lat.toFixed(5)}, ${l.gps.lng.toFixed(5)}` 
              : (l.ip || '-');

            const displayCity = isGps 
              ? `${l.gps.accuracy.toFixed(1)} meter (GPS)` 
              : (isClientGeo ? `${l.clientIpGeo.city} (IP HP)` : (isServerGeo ? `${l.ipGeo.city} (IP Server)` : '-'));

            const displayCountry = isClientGeo ? l.clientIpGeo.country : (isServerGeo ? l.ipGeo.country : '-');

            return (
              <tr key={i}>
                <td>{l.id}</td>
                <td>{l.type || '-'}</td>
                <td>{displayCoords}</td>
                <td>{displayCity}</td>
                <td>{displayCountry}</td>
                <td>{new Date(l.received || l.ts).toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}