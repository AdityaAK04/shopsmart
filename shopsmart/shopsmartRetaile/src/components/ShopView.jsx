import { useState, useEffect } from 'react';

export default function ShopView({ retailerId = 2, onSelectShop }) {
  const [shops, setShops] = useState([]);
  const [ownerInfo, setOwnerInfo] = useState({
    ownerName: 'Loading...',
    ownerEmail: 'Loading...'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit states
  const [editingShopId, setEditingShopId] = useState(null);
  const [editShopName, setEditShopName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [updating, setUpdating] = useState(false);

  // Add Shop states
  const [isAdding, setIsAdding] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchData = async () => {
    if (!retailerId) return;
    setLoading(true);
    setError(null);

    try {
      const ownerRes = await fetch(`http://localhost:8080/shopsmart/retailer/${retailerId}`);
      if (!ownerRes.ok) {
        throw new Error(`Retailer with ID ${retailerId} not found on port 8080 (404).`);
      }
      const ownerJson = await ownerRes.json();
      setOwnerInfo({
        ownerName: ownerJson.ownerName || 'Retailer',
        ownerEmail: ownerJson.ownerEmail || 'No email'
      });

      const shopRes = await fetch(`http://localhost:8081/shopsmart/shop/retailer/${retailerId}`);
      if (shopRes.ok) {
        const shopList = await shopRes.json();
        const initializedShops = (shopList || []).map(shop => ({
          ...shop,
          status: shop.status || 'ACTIVE' 
        }));
        setShops(initializedShops);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [retailerId]);

  const handleCreateShop = async (e) => {
    e.preventDefault();
    setAdding(true);

    try {
      const response = await fetch('http://localhost:8081/shopsmart/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: newShopName,
          address: newAddress,
          ownerId: Number(retailerId),
          status: 'ACTIVE'
        }),
      });

      if (!response.ok) throw new Error('Failed to create shop');

      alert('Shop added successfully!');
      setNewShopName('');
      setNewAddress('');
      setIsAdding(false);
      fetchData();
    } catch (err) {
      alert('Error adding shop: ' + err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateShop = async (e, shopId) => {
    e.preventDefault();
    setUpdating(true);

    const targetShop = shops.find(s => s.shopId === shopId);

    try {
      const response = await fetch(`http://localhost:8081/shopsmart/shop/${shopId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: editShopName,
          address: editAddress,
          ownerId: Number(retailerId),
          status: targetShop ? targetShop.status : 'ACTIVE'
        }),
      });

      if (!response.ok) throw new Error('Failed to update shop');

      alert('Shop updated successfully!');
      setEditingShopId(null);
      fetchData();
    } catch (err) {
      alert('Error updating shop: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (shop, e) => {
    e.stopPropagation(); 
    const newStatus = shop.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';

    try {
      const response = await fetch(`http://localhost:8081/shopsmart/shop/${shop.shopId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: shop.shopName,
          address: shop.address,
          ownerId: Number(retailerId),
          status: newStatus
        }),
      });

      if (!response.ok) throw new Error('Failed to change shop status');

      setShops(shops.map(s => s.shopId === shop.shopId ? { ...s, status: newStatus } : s));
    } catch (err) {
      alert('Error updating shop status: ' + err.message);
    }
  };

  const handleDeleteShop = async (shopId) => {
    if (!window.confirm(`Are you sure you want to delete Shop ID #${shopId}?`)) return;

    try {
      const response = await fetch(`http://localhost:8081/shopsmart/shop/${shopId}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete shop');
      }

      alert('Shop deleted successfully!');
      fetchData();
    } catch (err) {
      alert('Error deleting shop: ' + err.message);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading shops...</div>;
  
  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '24px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h3 style={{ color: '#991b1b', marginTop: 0 }}>Connection Error</h3>
        <p style={{ color: '#b91c1c', fontSize: '14px' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '40px 32px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Welcome back</h1>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#4f46e5' }}>{ownerInfo.ownerName}</h2>
          <p style={{ fontSize: '15px', color: '#6b7280', margin: '8px 0 0 0' }}>Retailer ID: {retailerId} &bull; Email: {ownerInfo.ownerEmail}</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)' }}
        >
          {isAdding ? 'Cancel' : '➕ Add New Shop'}
        </button>
      </div>

      {isAdding && (
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '28px', marginBottom: '36px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '18px' }}>Register New Shop</h3>
          <form onSubmit={handleCreateShop} style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Shop Name</label>
              <input type="text" value={newShopName} onChange={(e) => setNewShopName(e.target.value)} required style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px' }} />
            </div>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Address</label>
              <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} required style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px' }} />
            </div>
            <button type="submit" disabled={adding} style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', height: '44px', fontSize: '14px' }}>
              {adding ? 'Saving...' : 'Save Shop'}
            </button>
          </form>
        </div>
      )}

      <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', color: '#111827' }}>Registered Shops ({shops.length})</h2>

      {shops.length === 0 ? (
        <div style={{ backgroundColor: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>No shops found for this retailer ID.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {shops.map((shop) => {
            const isInactive = shop.status === 'INACTIVE';

            return (
              <div 
                key={shop.shopId} 
                style={{ 
                  backgroundColor: isInactive ? '#f3f4f6' : '#fff', 
                  borderRadius: '16px', 
                  border: '1px solid #e5e7eb', 
                  padding: '28px', 
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)', 
                  transition: 'all 0.2s',
                  opacity: isInactive ? 0.75 : 1
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '32px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ width: '220px', height: '150px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f3f4f6', flexShrink: 0, filter: isInactive ? 'grayscale(100%)' : 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600" alt="Store" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#4f46e5', backgroundColor: '#eef2ff', padding: '3px 10px', borderRadius: '6px' }}>
                            Shop ID #{shop.shopId}
                          </span>
                          
                          <span 
                            onClick={(e) => handleToggleStatus(shop, e)}
                            title="Click to toggle status"
                            style={{ 
                              fontSize: '12px', 
                              fontWeight: 'bold', 
                              textTransform: 'uppercase', 
                              color: isInactive ? '#dc2626' : '#059669', 
                              backgroundColor: isInactive ? '#fee2e2' : '#d1fae5', 
                              padding: '3px 10px', 
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span style={{ 
                              width: '7px', 
                              height: '7px', 
                              borderRadius: '50%', 
                              backgroundColor: isInactive ? '#dc2626' : '#059669' 
                            }}></span>
                            {shop.status || 'ACTIVE'}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: isInactive ? '#4b5563' : '#111827', margin: '0 0 6px 0' }}>{shop.shopName}</h3>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>📍 {shop.address}</p>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                        <button 
                          onClick={() => !isInactive && onSelectShop(shop)}
                          disabled={isInactive}
                          style={{ 
                            backgroundColor: isInactive ? '#9ca3af' : '#4f46e5', 
                            color: '#fff', 
                            border: 'none', 
                            fontSize: '13px', 
                            fontWeight: '600', 
                            padding: '8px 16px', 
                            borderRadius: '8px', 
                            cursor: isInactive ? 'not-allowed' : 'pointer' 
                          }}
                        >
                          📦 View Products
                        </button>

                        <button 
                          onClick={() => {
                            if (!isInactive) {
                              if (editingShopId === shop.shopId) {
                                setEditingShopId(null);
                              } else {
                                setEditingShopId(shop.shopId);
                                setEditShopName(shop.shopName);
                                setEditAddress(shop.address);
                              }
                            }
                          }}
                          disabled={isInactive}
                          style={{ 
                            backgroundColor: isInactive ? '#e5e7eb' : '#f9fafb', 
                            color: isInactive ? '#9ca3af' : '#374151', 
                            border: '1px solid #d1d5db', 
                            fontSize: '13px', 
                            fontWeight: '600', 
                            padding: '8px 14px', 
                            borderRadius: '8px', 
                            cursor: isInactive ? 'not-allowed' : 'pointer' 
                          }}
                        >
                          ✏️ {editingShopId === shop.shopId ? 'Cancel' : 'Edit'}
                        </button>

                        <button 
                          onClick={() => !isInactive && handleDeleteShop(shop.shopId)}
                          disabled={isInactive}
                          style={{ 
                            backgroundColor: isInactive ? '#e5e7eb' : '#fef2f2', 
                            color: isInactive ? '#9ca3af' : '#dc2626', 
                            border: `1px solid ${isInactive ? '#e5e7eb' : '#fecaca'}`, 
                            fontSize: '13px', 
                            fontWeight: '600', 
                            padding: '8px 14px', 
                            borderRadius: '8px', 
                            cursor: isInactive ? 'not-allowed' : 'pointer' 
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '8px' }}>Details</span>
                    <p style={{ fontSize: '14px', color: '#374151', margin: '4px 0' }}><strong>Owner ID:</strong> {shop.ownerId}</p>
                    <p style={{ fontSize: '14px', color: '#374151', margin: '4px 0' }}><strong>Shop ID:</strong> {shop.shopId}</p>
                  </div>
                </div>

                {editingShopId === shop.shopId && !isInactive && (
                  <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1f2937' }}>Edit Shop #{shop.shopId}</h4>
                    <form onSubmit={(e) => handleUpdateShop(e, shop.shopId)} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                      <input type="text" value={editShopName} onChange={(e) => setEditShopName(e.target.value)} required style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', flex: 1, minWidth: '200px' }} />
                      <input type="text" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} required style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', flex: 1, minWidth: '200px' }} />
                      <button type="submit" disabled={updating} style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Save Changes</button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}