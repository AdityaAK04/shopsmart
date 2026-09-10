import React from 'react';

const Header = ({ onViewChange, currentView, onLogout, profileImage, ownerName }) => {
  return (
    <header style={{
      backgroundColor: '#000',
      color: '#fff',
      padding: '16px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div 
        onClick={() => onViewChange('home')} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
      >
        <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '20px' }}>S</span>
        <span style={{ fontWeight: 600, letterSpacing: '0.5px' }}>ShopSmart</span>
      </div>

      <nav style={{ display: 'flex', gap: '32px', fontSize: '14px', color: '#d1d5db' }}>
        <button 
          onClick={() => onViewChange('home')} 
          style={{ background: 'none', border: 'none', color: currentView === 'home' ? '#fff' : '#d1d5db', fontWeight: currentView === 'home' ? 500 : 400, cursor: 'pointer', fontSize: '14px' }}
        >
          Home
        </button>
        
        <button 
          onClick={() => onViewChange('shop')} 
          style={{ background: 'none', border: 'none', color: currentView === 'shop' ? '#fff' : '#d1d5db', fontWeight: currentView === 'shop' ? 500 : 400, cursor: 'pointer', fontSize: '14px' }}
        >
          My shop
        </button>
        
        <button 
          onClick={() => onViewChange('profile')} 
          style={{ background: 'none', border: 'none', color: currentView === 'profile' ? '#fff' : '#d1d5db', fontWeight: currentView === 'profile' ? 500 : 400, cursor: 'pointer', fontSize: '14px' }}
        >
          Profile
        </button>

        <button 
          onClick={() => onViewChange('add-voucher')} 
          style={{ background: 'none', border: 'none', color: currentView === 'add-voucher' ? '#22c55e' : '#d1d5db', fontWeight: currentView === 'add-voucher' ? 500 : 400, cursor: 'pointer', fontSize: '14px' }}
        >
          Add Vouchers
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Profile Image & Info Button */}
        <button 
          onClick={() => onViewChange('profile')} 
          title="Profile Settings"
          style={{ 
            background: currentView === 'profile' ? '#1f2937' : 'transparent', 
            border: currentView === 'profile' ? '1px solid #22c55e' : '1px solid transparent', 
            borderRadius: '9999px', 
            padding: '4px 12px 4px 4px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s'
          }}
        >
          {/* Avatar Image Container */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#1e3a8a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Profile Avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
                {ownerName ? ownerName.charAt(0).toUpperCase() : 'A'}
              </span>
            )}
          </div>

          {/* Profile Name Text */}
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff', lineHeight: '1.2' }}>
              {ownerName || 'Retailer'}
            </span>
            <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: '500' }}>
              Verified
            </span>
          </div>
        </button>

        <button 
          onClick={onLogout}
          style={{
            border: '1px solid #374151',
            padding: '6px 16px',
            borderRadius: '9999px',
            fontSize: '12px',
            color: '#d1d5db',
            background: 'transparent',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;