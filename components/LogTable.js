export default function LogTable({ logs = [] }) {
  if (!logs.length) return <p style={{ color: '#8e8e93', textAlign: 'center', marginTop: '20px' }}>Belum ada data log.</p>;

  return (
    <div style={{ 
      backgroundColor: '#ffffff', 
      borderRadius: '16px', 
      boxShadow: '0 4px 24px rgba(0,0,0,0.04)', 
      overflow: 'hidden' 
    }}>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', whiteSpace: 'nowrap' }}>
          <thead style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #e5e5ea' }}>
            <tr>
              <th style={{ padding: '16px', fontWeight: '700', color: '#8e8e93' }}>Waktu</th>
              <th style={{ padding: '16px', fontWeight: '700', color: '#8e8e93' }}>Tipe</th>
              <th style={{ padding: '16px', fontWeight: '700', color: '#8e8e93' }}>IP / GPS</th>
              <th style={{ padding: '16px', fontWeight: '700', color: '#8e8e93' }}>Lokasi</th>
              <th style={{ padding: '16px', fontWeight: '700', color: '#8e8e93' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => {
              const geo = l.clientIpGeo || l.ipGeo || {};
              const lat = l.gps ? l.gps.lat : geo.lat;
              const lng = l.gps ? l.gps.lng : geo.lng;
              const rawIp = l.ip || geo.ip || 'Unknown';

              return (
                <tr key={i} style={{ borderBottom: i === logs.length - 1 ? 'none' : '1px solid #e5e5ea' }}>
                  <td style={{ padding: '16px', color: '#000', fontWeight: '500' }}>
                    {new Date(l.ts || l.received).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '12px',
                      fontWeight: '700',
                      backgroundColor: l.gps ? '#e3f2fd' : '#f2f2f7', 
                      color: l.gps ? '#007aff' : '#8e8e93'
                    }}>
                      {l.gps ? 'GPS Akurat' : 'IP Only'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#007aff', fontWeight: '600' }}>
                    {rawIp}
                  </td>
                  <td style={{ padding: '16px', color: '#8e8e93', fontWeight: '500' }}>
                    {l.gps ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : (geo.city ? `${geo.city}, ${geo.country}` : '-')}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {lat && lng ? (
                      <a 
                        href={`https://www.google.com/maps?q=${lat},${lng}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ 
                          padding: '8px 16px', 
                          backgroundColor: '#f2f2f7', 
                          color: '#007aff', 
                          borderRadius: '10px', 
                          textDecoration: 'none', 
                          fontSize: '13px', 
                          fontWeight: '700',
                          display: 'inline-block'
                        }}
                      >
                        Lihat Peta
                      </a>
                    ) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}