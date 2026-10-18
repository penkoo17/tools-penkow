function toFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeLog(log, index) {
  const geo = log.clientIpGeo || log.ipGeo || {};
  const gpsLat = log.gps ? toFiniteNumber(log.gps.lat) : null;
  const gpsLng = log.gps ? toFiniteNumber(log.gps.lng) : null;
  const geoLat = toFiniteNumber(geo.lat);
  const geoLng = toFiniteNumber(geo.lng);
  const isGps = gpsLat !== null && gpsLng !== null;
  const lat = isGps ? gpsLat : geoLat;
  const lng = isGps ? gpsLng : geoLng;
  const timestamp = log.ts || log.received || log.timestamp;
  const date = timestamp ? new Date(timestamp) : null;
  const hasValidDate = date && !Number.isNaN(date.getTime());
  const location = isGps
    ? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    : [geo.city, geo.country].filter(Boolean).join(', ') || '—';

  return {
    key: log.id_waktu || `${timestamp || 'log'}-${index}`,
    time: hasValidDate
      ? date.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
      : '—',
    isGps,
    typeLabel: isGps ? 'GPS' : 'IP',
    ip: log.ip || geo.ip || 'Unknown',
    location,
    mapsUrl:
      isGps || (lat !== null && lng !== null)
        ? `https://www.google.com/maps?q=${lat},${lng}`
        : null
  };
}

function MapArrow() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M3 9L9 3M4 3H9V8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyState() {
  return (
    <div className="empty">
      <span className="empty-icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect
            x="2.5"
            y="4"
            width="15"
            height="12"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M2.5 8H17.5M7 4V2.5M13 4V2.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <p className="empty-text">Belum ada log</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="skeleton" aria-busy="true" aria-label="Memuat">
      {[0, 1, 2, 3].map(item => (
        <div className="skeleton-row" key={item}>
          <span className="skeleton-bar w-20" />
          <span className="skeleton-bar w-35" />
          <span className="skeleton-bar w-50" />
        </div>
      ))}
    </div>
  );
}

export default function LogTable({ logs = [], loading = false }) {
  if (loading && logs.length === 0) return <LoadingState />;
  if (!logs.length) return <EmptyState />;

  const rows = logs.map(normalizeLog);

  return (
    <>
      <div className="table-card">
        <div className="table-scroll">
          <table className="log-table">
            <thead>
              <tr>
                <th scope="col">Waktu</th>
                <th scope="col">Tipe</th>
                <th scope="col">IP</th>
                <th scope="col">Lokasi</th>
                <th scope="col">Peta</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.key}>
                  <td>{row.time}</td>
                  <td>
                    <span className={`badge ${row.isGps ? 'badge-gps' : 'badge-ip'}`}>
                      {row.typeLabel}
                    </span>
                  </td>
                  <td>
                    <span className="ip" title={row.ip}>
                      {row.ip}
                    </span>
                  </td>
                  <td className="muted">{row.location}</td>
                  <td>
                    {row.mapsUrl ? (
                      <a
                        className="map-link"
                        href={row.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Peta
                        <MapArrow />
                      </a>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cards">
        {rows.map(row => (
          <article className="log-card" key={row.key}>
            <div className="log-card-top">
              <span className="log-card-time">{row.time}</span>
              <span className={`badge ${row.isGps ? 'badge-gps' : 'badge-ip'}`}>
                {row.typeLabel}
              </span>
            </div>

            <div className="log-card-ip">{row.ip}</div>
            <div className="log-card-loc">{row.location}</div>

            {row.mapsUrl && (
              <div className="log-card-foot">
                <a
                  className="map-link"
                  href={row.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Peta
                  <MapArrow />
                </a>
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
