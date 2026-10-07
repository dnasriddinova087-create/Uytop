import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 900, color: '#0F382A', lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginTop: '1rem' }}>
        Sahifa topilmadi
      </h2>
      <p style={{ color: '#6B7280', maxWidth: '400px', marginTop: '0.5rem', marginBottom: '2rem' }}>
        Kechirasiz, siz qidirayotgan sahifa ko'chirilgan yoki o'chirilgan bo'lishi mumkin.
      </p>
      <Link to="/" className="btn btn-primary" id="btn-back-home-404">
        <Home size={18} /> Bosh sahifaga qaytish
      </Link>
    </div>
  );
};
