import SiteChrome from '../../components/SiteChrome';

export default function PlayerLoading() {
  return (
    <SiteChrome activeView="players">
      <main className="main-content player-detail-main-content">
        <div id="player-detail-view" className="view active">
          <div
            className="player-detail-shell"
            style={{
              width: '100%',
              maxWidth: 'none',
              margin: '0',
              padding: '0 0 32px',
              background: 'rgba(20, 24, 28, 0.5)',
              backdropFilter: 'blur(25px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              minHeight: '100vh',
              borderRadius: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}
          >
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
              <div 
                style={{
                  width: '60px',
                  height: '60px',
                  border: '4px solid rgba(255, 255, 255, 0.1)',
                  borderTop: '4px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 20px'
                }}
              />
              <h2 style={{ color: '#fff', fontWeight: '500', letterSpacing: '1px' }}>
                Loading Player Data...
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: '8px' }}>
                Fetching stats and related cards
              </p>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </SiteChrome>
  );
}
