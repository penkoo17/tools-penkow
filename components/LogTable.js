export default function LogTable({ logs = [] }) {
  if (!logs.length) return <p style={{ color: '#8e8e93', textAlign: 'center', marginTop: '40px', fontSize: '15px', fontWeight: '500' }}>Belum ada data log yang masuk.</p>;

  return (
    <div style={{ 
      backgroundColor: '#ffffff', 
      borderRadius: '20px', 
      boxShadow: '0 8px 32px rgba(0,0,0,0.04)', 
      overflow: 'hidden',
      border: '1px solid #e5e5ea'
    }}>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', whiteSpace: 'nowrap' }}>
          <thead style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #e5e5ea' }}>
            <tr>
              <th style={{ padding: '16px 20px', fontWeight: '700', color: '#8e8e93', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' }}>Waktu</th>
              <th style={{ padding: '16px 20px', fontWeight: '700', color: '#8e8e93', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' }}>Tipe</th>
              <th style={{ padding: '16px 20px', fontWeight: '700', color: '#8e8e93', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' }}>IP / GPS</th>
              <th style={{ padding: '16px 20px', fontWeight: '700', color: '#8e8e93', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' }}>Lokasi</th>
              <th style={{ padding: '16px 20px', fontWeight: '700', color: '#8e8e93', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' }}>Aksi</th>
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
                  <td style={{ padding: '16px 20px', color: '#000', fontWeight: '600' }}>
                    {new Date(l.ts || l.received).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px',
                      fontWeight: '700',
                      backgroundColor: l.gps ? '#e3f2fd' : '#f2f2f7', 
                      color: l.gps ? '#007aff' : '#8e8e93'
                    }}>
                      {l.gps ? 'GPS Akurat' : 'IP Only'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#007aff', fontWeight: '600', fontFamily: 'monospace' }}>
                    {rawIp}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#000', fontWeight: '500' }}>
                    {l.gps ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : (geo.city ? `${geo.city}, ${geo.country}` : '-')}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
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
                          display: 'inline-block',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Buka Peta
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