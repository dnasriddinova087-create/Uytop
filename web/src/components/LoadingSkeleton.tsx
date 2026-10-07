import React from 'react';

export const PropertyCardSkeleton: React.FC = () => {
  return (
    <div
      className="property-card"
      style={{
        animation: 'pulse 1.5s infinite ease-in-out',
        background: '#FFFFFF',
      }}
    >
      <div style={{ height: '210px', background: '#E5E7EB' }} />
      <div style={{ padding: '1.25rem' }}>
        <div style={{ height: '24px', width: '60%', background: '#E5E7EB', borderRadius: '6px', marginBottom: '8px' }} />
        <div style={{ height: '18px', width: '90%', background: '#E5E7EB', borderRadius: '6px', marginBottom: '8px' }} />
        <div style={{ height: '14px', width: '50%', background: '#E5E7EB', borderRadius: '4px', marginBottom: '16px' }} />
        <div style={{ height: '20px', width: '100%', background: '#F3F4F6', borderRadius: '4px' }} />
      </div>
    </div>
  );
};

export const LoadingSpinner: React.FC<{ text?: string }> = ({ text = "Yuklanmoqda..." }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid #E5E7EB',
          borderTopColor: '#0F382A',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <p style={{ marginTop: '1rem', color: '#6B7280', fontSize: '0.9rem', fontWeight: 600 }}>{text}</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
