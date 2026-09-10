import React, { useState, useEffect, useRef } from 'react';

const ProfileRetailer = ({ onViewChange, retailerId = 2 }) => {
  const [profileData, setProfileData] = useState({
    ownerId: retailerId,
    ownerName: 'Loading...',
    ownerEmail: 'Loading...',
    associatedRetailEntity: 'Storedf Flagship Retail Pvt Ltd',
    contactNumber: '+91 (080) 4122-8900',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profileImage: null,
    twoFactorAuth: true
  });

  const [shops, setShops] = useState([]);
  const [activeVouchersCount, setActiveVouchersCount] = useState(0); 
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [shopsLoading, setShopsLoading] = useState(true);
  
  const fileInputRef = useRef(null);

  // Fetch retailer profile, shops, and MongoDB profile image on load
  useEffect(() => {
    const fetchRetailerData = async () => {
      try {
        // 1. Fetch Owner Profile & MongoDB Image from Port 8080
        const profileRes = await fetch(`http://localhost:8080/shopsmart/retailer/${retailerId}`);
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfileData(prev => ({
            ...prev,
            ownerId: data.ownerId || data.id || prev.ownerId,
            ownerName: data.ownerName || data.name || prev.ownerName,
            ownerEmail: data.ownerEmail || data.email || prev.ownerEmail,
            profileImage: data.profileImage || prev.profileImage // Fetches Base64 from MongoDB via backend mapping
          }));
        }

        // 2. Fetch Actual Dynamic Shops (Port 8081)
        const shopRes = await fetch(`http://localhost:8081/shopsmart/shop/retailer/${retailerId}`);
        if (shopRes.ok) {
          const shopData = await shopRes.json();
          let shopList = [];
          if (Array.isArray(shopData)) {
            shopList = shopData;
          } else if (shopData && Array.isArray(shopData.shops)) {
            shopList = shopData.shops;
          } else if (shopData && Array.isArray(shopData.data)) {
            shopList = shopData.data;
          }
          setShops(shopList);
        }

        // 3. Fetch Dynamic Vouchers Count (Port 8089)
        const voucherRes = await fetch('http://localhost:8089/shopsmart/loyaltyTransaction/retailer/vouchers');
        if (voucherRes.ok) {
          const voucherData = await voucherRes.json();
          if (Array.isArray(voucherData)) {
            const filteredVouchers = voucherData.filter(v => v.ownerId === retailerId);
            setActiveVouchersCount(filteredVouchers.length);
          }
        }
      } catch (error) {
        console.error('Error fetching retailer, shop or voucher data:', error);
      } finally {
        setShopsLoading(false);
      }
    };

    fetchRetailerData();
  }, [retailerId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData({
      ...profileData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          profileImage: reader.result // Converts image to Base64 string to save in MongoDB
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    
    // Password Validation checks if a new password is provided
    if (profileData.newPassword) {
      if (profileData.newPassword.length < 3) {
        setStatusMessage('Error: Password must be at least 3 characters long.');
        return;
      }
      if (!/[A-Z]/.test(profileData.newPassword)) {
        setStatusMessage('Error: Password must contain at least one capital letter.');
        return;
      }
      if (!/[a-z]/.test(profileData.newPassword)) {
        setStatusMessage('Error: Password must contain at least one small letter.');
        return;
      }
      if (!/[0-9]/.test(profileData.newPassword)) {
        setStatusMessage('Error: Password must contain at least one numeric character.');
        return;
      }
      if (profileData.newPassword !== profileData.confirmPassword) {
        setStatusMessage('Error: New password and confirmation password do not match.');
        return;
      }
      if (!profileData.currentPassword) {
        setStatusMessage('Error: Please enter your current master password.');
        return;
      }
    }

    setLoading(true);
    setStatusMessage('');

    try {
      // Constructs payload including profileImage for MongoDB storage and owner details for MySQL
      const updatePayload = {
        ownerName: profileData.ownerName,
        ownerEmail: profileData.ownerEmail,
        profileImage: profileData.profileImage, // Saved to MongoDB document collection
        ...(profileData.newPassword && { ownerPassword: profileData.newPassword })
      };

      const response = await fetch(`http://localhost:8080/shopsmart/retailer/${profileData.ownerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });

      if (response.ok) {
        setStatusMessage('Profile, account settings & MongoDB image updated successfully!');
        setTimeout(() => {
          onViewChange('home');
        }, 1000); 
      } else {
        setStatusMessage('Failed to update profile settings.');
      }
    } catch (error) {
      console.error('Network error:', error);
      setStatusMessage('Network error: Could not save changes.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate dynamic active shop stats
  const activeShopsCount = shops.filter(s => s.status !== 'INACTIVE').length;

  return (
    <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '24px 40px 60px 40px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', boxSizing: 'border-box' }}>
      
      {/* Breadcrumb Navigation & Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <span onClick={() => onViewChange('home')} style={{ cursor: 'pointer', color: '#2563eb' }}>Back to Home</span>
            <span>/</span>
            <span style={{ color: '#0f172a' }}>Retailer Profile</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Retailer Profile</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Manage your Profile.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button"
            onClick={() => onViewChange('home')}
            style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', color: '#334155', padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            Discard Changes
          </button>
          <button 
            type="button"
            onClick={handleSaveChanges}
            disabled={loading}
            style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div style={{ padding: '12px 16px', marginBottom: '20px', borderRadius: '8px', fontSize: '13px', backgroundColor: statusMessage.includes('Error') || statusMessage.includes('Failed') ? '#fee2e2' : '#dcfce7', color: statusMessage.includes('Error') || statusMessage.includes('Failed') ? '#991b1b' : '#166534', fontWeight: '500' }}>
          {statusMessage}
        </div>
      )}

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Sidebar Profile Summary Card */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          
          {/* Profile Picture Container with Camera Icon Upload Trigger */}
          <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 16px auto' }}>
            <div 
              onClick={() => fileInputRef.current.click()}
              style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#1e3a8a', 
                color: '#fff', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '24px', 
                fontWeight: '800', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
            >
              {profileData.profileImage ? (
                <img src={profileData.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profileData.ownerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
              )}
            </div>

            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />

            {/* Camera Badge Icon Button */}
            <div 
              onClick={() => fileInputRef.current.click()}
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                backgroundColor: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              title="Change Profile Picture"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </div>
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>{profileData.ownerName}</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px 0' }}>{profileData.ownerEmail}</p>
          
          <div style={{ display: 'inline-block', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', marginBottom: '16px' }}>
            ✓ Verified Retailer &nbsp; • &nbsp; owner_id: #{profileData.ownerId}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '16px 0', margin: '16px 0', textAlign: 'left' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Stores</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{shops.length}</div>
              <div style={{ fontSize: '10px', color: '#10b981', fontWeight: '600' }}>{activeShopsCount} Operational</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Active Vouchers</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{activeVouchersCount}</div>
              <div style={{ fontSize: '10px', color: '#2563eb', fontWeight: '600' }}>Running campaigns</div>
            </div>
          </div>
        </div>

        {/* Right Content Form Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* General Profile Information */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Profile Information</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>System Owner ID (owner_id)</label>
                <input 
                  type="text" 
                  name="ownerId" 
                  value={profileData.ownerId} 
                  disabled 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '13px', boxSizing: 'border-box' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>Full Owner Name (ownerName)</label>
                <input 
                  type="text" 
                  name="ownerName" 
                  value={profileData.ownerName} 
                  onChange={handleChange} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', fontWeight: '600', color: '#0f172a' }} 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>Owner Primary Email (ownerEmail)</label>
                <input 
                  type="email" 
                  name="ownerEmail" 
                  value={profileData.ownerEmail} 
                  onChange={handleChange} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} 
                />
              </div>
            </div>
          </div>

          {/* Authentication & Security Section */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Update Password</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 20px 0' }}>Manages updates (ownerPassword).</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>Current Master Password</label>
                <input 
                  type="password" 
                  name="currentPassword" 
                  placeholder="••••••••••••" 
                  value={profileData.currentPassword} 
                  onChange={handleChange} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>New Password</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  placeholder="Min 3 chars (1 upper, 1 lower, 1 num)" 
                  value={profileData.newPassword} 
                  onChange={handleChange} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  placeholder="Confirm identical password" 
                  value={profileData.confirmPassword} 
                  onChange={handleChange} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} 
                />
              </div>
            </div>
          </div>

          {/* Dynamic Store Ownership & Linked Outlets Section */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Store Outlets</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>outlets entities of owner_id: {profileData.ownerId}.</p>

            {shopsLoading ? (
              <p style={{ fontSize: '13px', color: '#64748b' }}>Loading registered shops...</p>
            ) : shops.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#64748b' }}>No shops registered under this retailer profile yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {shops.map((shop, index) => {
                  const isInactive = shop.status === 'INACTIVE';
                  return (
                    <div key={shop.shopId || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: isInactive ? '#f3f4f6' : '#f8fafc', opacity: isInactive ? 0.7 : 1 }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                          {shop.shopName} 
                          {index === 0 && (
                            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', marginLeft: '6px' }}>First Entry</span>
                          )}
                          <span style={{ backgroundColor: isInactive ? '#fee2e2' : '#e0e7ff', color: isInactive ? '#991b1b' : '#3730a3', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', marginLeft: '6px' }}>
                            {shop.status || 'ACTIVE'}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Outlet #{shop.shopId} • {shop.address}</div>
                      </div>
                      <button onClick={() => onViewChange('shop')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Jump to Store →</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfileRetailer;