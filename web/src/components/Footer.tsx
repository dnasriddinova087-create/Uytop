import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="brand-logo" style={{ color: '#FFFFFF', marginBottom: '1rem' }}>
              <Home size={28} color="#10B981" strokeWidth={2.5} />
              <span>Uy<span style={{ color: '#10B981' }}>Top</span></span>
            </div>
            <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '1.25rem', maxWidth: '320px' }}>
              O'zbekistonda uylarni ishonchli va vositachiliksiz ijaraga berish va olish bo'yicha yagona zamonaviy platforma.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#9CA3AF', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="#10B981" /> Toshkent shahri, O'zbekiston
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="#10B981" /> +998 (71) 200-00-00
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="#10B981" /> info@uytop.uz
              </div>
            </div>
          </div>

          <div className="footer-col">
            <h4>Platforma</h4>
            <ul className="footer-links">
              <li><Link to="/">Bosh sahifa</Link></li>
              <li><Link to="/catalog">Barcha e'lonlar</Link></li>
              <li><Link to="/catalog?view=map">Xarita bo'yicha qidiruv</Link></li>
              <li><Link to="/catalog?rent_type=monthly">Oylik ijara</Link></li>
              <li><Link to="/catalog?rent_type=daily">Kunlik ijara</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Foydalanuvchilar</h4>
            <ul className="footer-links">
              <li><Link to="/login">Kabinetga kirish</Link></li>
              <li><Link to="/register">Ro'yxatdan o'tish</Link></li>
              <li><Link to="/broker/add-property">Makler: Uy qo'shish</Link></li>
              <li><Link to="/client">Mijoz kabineti</Link></li>
              <li><Link to="/favorites">Saqlangan uylar</Link></li>
              <li><Link to="/login?role=admin" style={{ color: '#34D399', fontWeight: 700 }}>🛡️ Admin Panel (Nasriddinova Dilfuza)</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Viloyatlar</h4>
            <ul className="footer-links">
              <li><Link to="/catalog?region=Toshkent+shahri">Toshkent shahri</Link></li>
              <li><Link to="/catalog?region=Samarqand+viloyati">Samarqand viloyati</Link></li>
              <li><Link to="/catalog?region=Buxoro+viloyati">Buxoro viloyati</Link></li>
              <li><Link to="/catalog?region=Farg'ona+viloyati">Farg'ona viloyati</Link></li>
              <li><Link to="/catalog?region=Andijon+viloyati">Andijon viloyati</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} UyTop. Barcha huquqlar himoyalangan.</p>
          <p>O'zbekiston bo'ylab xavfsiz va qulay ijara.</p>
        </div>
      </div>
    </footer>
  );
};
