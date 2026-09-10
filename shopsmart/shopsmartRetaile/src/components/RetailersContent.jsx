import React, { useState, useEffect } from 'react';

const RetailersContent = ({ retailerId, onViewChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [retailerInfo, setRetailerInfo] = useState({ ownerName: '', ownerEmail: '' });

  // Fetch retailer data (ownerName, ownerEmail) from backend using the entity fields
  useEffect(() => {
    if (retailerId) {
      fetch(`http://localhost:8080/shopsmart/retailer/${retailerId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setRetailerInfo({
              ownerName: data.ownerName || 'Retailer',
              ownerEmail: data.ownerEmail || 'Not provided'
            });
          }
        })
        .catch(err => console.error('Error fetching retailer details:', err));
    }
  }, [retailerId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();

    if (!query) return;

    // Check keywords to route to the correct view
    if (query.includes('shop') || query.includes('my shop')) {
      onViewChange && onViewChange('shop');
    } else if (query.includes('voucher') || query.includes('add voucher') || query.includes('add vouchers')) {
      onViewChange && onViewChange('add-voucher');
    } else if (query.includes('profile') || query.includes('account')) {
      onViewChange && onViewChange('profile');
    } else {
      onViewChange && onViewChange('shop');
    }
  };

  return (
    <main style={{
      flex: 1,
      backgroundColor: '#fff',
      padding: '48px 64px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start'
    }}>
      {/* Top Hero Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', alignItems: 'center' }}>
        
        {/* Left Column */}
        <div>
          <h1 style={{ fontSize: '56px', fontWeight: 800, lineHeight: 1.1, color: '#111827', margin: 0 }}>
            Shop Local. <br />
            <span style={{ color: '#16a34a' }}>Earn More.</span> <br />
            Live Smarter.
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '16px', maxWidth: '480px' }}>
            Discover products from local retailers, earn loyalty rewards and get offers personalized just for you.
          </p>

          {/* Search Bar Form */}
          <form onSubmit={handleSearchSubmit} style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '9999px',
            padding: '8px',
            maxWidth: '520px',
            marginTop: '24px'
          }}>
            <span style={{ paddingLeft: '12px', color: '#9ca3af' }}>🔍</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ex:- Add Vouchers" 
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                width: '100%',
                padding: '0 12px',
                fontSize: '14px',
                color: '#374151'
              }}
            />
            <button type="submit" style={{
              backgroundColor: '#111827',
              color: '#fff',
              padding: '10px 24px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer'
            }}>
              Search
            </button>
          </form>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <button 
              onClick={() => onViewChange && onViewChange('shop')}
              style={{
                backgroundColor: '#14532d',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>My Shops</span>
              <span>→</span>
            </button>
            
            <button 
              onClick={() => onViewChange && onViewChange('add-voucher')}
              style={{
                backgroundColor: '#f3f4f6',
                color: '#1f2937',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Add Vouchers
            </button>
          </div>

          {/* Sub-nav Links */}
          <div style={{ display: 'flex', gap: '24px', fontSize: '12px', color: '#6b7280', marginTop: '24px' }}>
            <span>🏪 Local Shops</span>
            <span>🎁 Smart Rewards</span>
            <span>🏷️ Personalized Offers</span>
          </div>

         {/* Compact "About Me" Card placed right below (id="contact" removed) */}
          <div style={{
            marginTop: '28px',
            padding: '10px 18px',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '24px',
            width: 'fit-content'
          }}>
            <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              About Me
            </span>
            <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#374151' }}>
              <div>
                <strong style={{ color: '#111827' }}>{retailerInfo.ownerName}</strong>
              </div>
              <div>
                <strong style={{ color: '#4b5563' }}>{retailerInfo.ownerEmail}</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Shopping Bag Mockup */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '240px',
            height: '300px',
            background: 'linear-gradient(to bottom, #16a34a, #14532d)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            transform: 'rotate(3deg)'
          }}>
            <div style={{
              position: 'absolute',
              top: '-30px',
              width: '100px',
              height: '40px',
              border: '4px solid #15803d',
              borderBottom: 'none',
              borderTopLeftRadius: '50px',
              borderTopRightRadius: '50px'
            }}></div>
            <span style={{ color: '#fff', fontFamily: 'serif', fontSize: '100px', fontWeight: 'bold' }}>S</span>
          </div>
        </div>

      </div>

    </main>
  );
};

export default RetailersContent;