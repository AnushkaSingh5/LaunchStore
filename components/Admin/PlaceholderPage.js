'use client';

export default function PlaceholderPage({ title = 'Module Under Development' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', background: '#f5f3ff', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '32px' }}>🚧</span>
      </div>
      <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>{title}</h2>
      <p style={{ color: '#64748b', maxWidth: '400px' }}>This administrative module is currently being optimized for platform-wide scale. Check back soon for full integration.</p>
      
      <style jsx>{`
        div { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
}
