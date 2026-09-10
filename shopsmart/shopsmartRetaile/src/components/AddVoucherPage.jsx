import React, { useState, useEffect } from 'react';

const AddVoucherPage = ({ retailerId }) => {
  const [formData, setFormData] = useState({
    ownerId: retailerId || '',
    voucherCode: '',
    pointsCost: '40',
    expiryDays: '30'
  });

  const [retailerVouchers, setRetailerVouchers] = useState([]);
  const [retailersList, setRetailersList] = useState([]);
  const [shopsList, setShopsList] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // State to track if we are currently editing a specific voucher ID
  const [editingVoucherId, setEditingVoucherId] = useState(null);

  // UI Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  // Keep state synced if the retailerId prop changes
  useEffect(() => {
    if (retailerId) {
      setFormData(prev => ({
        ...prev,
        ownerId: retailerId
      }));
    }
  }, [retailerId]);

  // Fetch Retailer Vouchers
  const fetchRetailerVouchers = async () => {
    try {
      const response = await fetch('http://localhost:8089/shopsmart/loyaltyTransaction/retailer/vouchers');
      if (response.ok) {
        const data = await response.json();
        setRetailerVouchers(data);
      }
    } catch (error) {
      console.error('Error fetching retailer vouchers:', error);
    }
  };

  // Fetch Retailers list dynamically
  const fetchRetailersList = async () => {
    try {
      const response = await fetch('http://localhost:8080/shopsmart/retailer');
      if (response.ok) {
        const data = await response.json();
        setRetailersList(data);
      }
    } catch (error) {
      console.error('Error fetching retailers list:', error);
    }
  };

  // Fetch Shops list to map shop names into auto-generated codes
  const fetchShopsList = async () => {
    try {
      const response = await fetch('http://localhost:8081/shopsmart/shop');
      if (response.ok) {
        const data = await response.json();
        setShopsList(data);
      }
    } catch (error) {
      console.error('Error fetching shops list:', error);
    }
  };

  useEffect(() => {
    fetchRetailerVouchers();
    fetchRetailersList();
    fetchShopsList();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuickPick = (days) => {
    setFormData({ ...formData, expiryDays: days });
  };

  // Auto-generate code using Shop Name + Year + Random String
  const handleAutoGenerate = () => {
    let shopPrefix = 'SHOPSMART';
    
    const activeOwner = formData.ownerId || retailerId;
    if (activeOwner) {
      const matchedShop = shopsList.find(s => Number(s.ownerId) === Number(activeOwner));
      if (matchedShop && matchedShop.shopName) {
        shopPrefix = matchedShop.shopName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
      }
    }

    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const generatedCode = `${shopPrefix}-${currentYear}-${randomSuffix}`;
    setFormData({ ...formData, voucherCode: generatedCode });
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  // Populate form with voucher data for editing
  const handleEditClick = (voucher) => {
    setEditingVoucherId(voucher.id || voucher.voucherId);
    setFormData({
      ownerId: voucher.ownerId || retailerId || '',
      voucherCode: voucher.voucherCode || '',
      pointsCost: voucher.pointsCost || '40',
      expiryDays: voucher.expiryDays || '30'
    });
    setStatusMessage(`Editing voucher: ${voucher.voucherCode}`);
  };

  // Cancel edit mode and clear form
  const handleCancelEdit = () => {
    setEditingVoucherId(null);
    setFormData({ ownerId: retailerId || '', voucherCode: '', pointsCost: '40', expiryDays: '30' });
    setStatusMessage('');
  };

  // Delete Voucher Action
  const handleDeleteClick = async (voucherId) => {
    if (!window.confirm("Are you sure you want to delete this voucher?")) return;

    try {
      const response = await fetch(`http://localhost:8089/shopsmart/loyaltyTransaction/retailer/vouchers/${voucherId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStatusMessage('Voucher deleted successfully!');
        fetchRetailerVouchers();
        if (editingVoucherId === voucherId) {
          handleCancelEdit();
        }
      } else {
        setStatusMessage('Failed to delete voucher.');
      }
    } catch (error) {
      console.error('Error deleting voucher:', error);
      setStatusMessage('Network error: Could not delete voucher.');
    }
  };

  // EXPORT CSV HANDLER
  const handleExportCSV = () => {
    if (retailerVouchers.length === 0) {
      setStatusMessage('No vouchers available to export.');
      return;
    }

    const headers = ['id', 'ownerId', 'voucherCode', 'pointsCost', 'expiryDays'];
    const csvRows = [headers.join(',')];

    retailerVouchers.forEach(v => {
      const row = [
        v.id || v.voucherId || '',
        v.ownerId || '',
        `"${(v.voucherCode || '').replace(/"/g, '""')}"`,
        v.pointsCost || '',
        v.expiryDays || ''
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `retailer_vouchers_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMessage('Vouchers exported successfully as CSV!');
  };

  // IMPORT CSV HANDLER
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length < 2) {
        setStatusMessage('CSV file is empty or missing data rows.');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const ownerIdx = headers.indexOf('ownerId');
      const codeIdx = headers.indexOf('voucherCode');
      const costIdx = headers.indexOf('pointsCost');
      const daysIdx = headers.indexOf('expiryDays');

      if (ownerIdx === -1 || codeIdx === -1 || costIdx === -1 || daysIdx === -1) {
        setStatusMessage('Invalid CSV headers. Required: ownerId, voucherCode, pointsCost, expiryDays');
        return;
      }

      setLoading(true);
      let successCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => val.trim().replace(/^"|"$/g, ''));
        
        if (row.length >= 4) {
          const payload = {
            ownerId: Number(row[ownerIdx]),
            voucherCode: row[codeIdx],
            pointsCost: Number(row[costIdx]),
            expiryDays: Number(row[daysIdx])
          };

          try {
            const response = await fetch('http://localhost:8089/shopsmart/loyaltyTransaction/retailer/vouchers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (response.ok) successCount++;
          } catch (err) {
            console.error('Error importing row:', err);
          }
        }
      }

      setLoading(false);
      setStatusMessage(`Imported ${successCount} vouchers successfully!`);
      fetchRetailerVouchers();
      e.target.value = null;
    };

    reader.readAsText(file);
  };

  // Handles both Create (POST) and Update (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');

    const isEditing = editingVoucherId !== null;
    const url = isEditing 
      ? `http://localhost:8089/shopsmart/loyaltyTransaction/retailer/vouchers/${editingVoucherId}`
      : 'http://localhost:8089/shopsmart/loyaltyTransaction/retailer/vouchers';
    
    const method = isEditing ? 'PUT' : 'POST';

    const activeOwnerId = formData.ownerId || retailerId;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerId: Number(activeOwnerId),
          voucherCode: formData.voucherCode,
          pointsCost: Number(formData.pointsCost),
          expiryDays: Number(formData.expiryDays)
        }),
      });

      if (response.ok) {
        setStatusMessage(isEditing ? 'Voucher updated successfully!' : 'Voucher created successfully!');
        setFormData({ ownerId: retailerId || '', voucherCode: '', pointsCost: '40', expiryDays: '30' });
        setEditingVoucherId(null);
        fetchRetailerVouchers();
      } else {
        setStatusMessage('Failed to save voucher. Please check inputs.');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatusMessage('Network error: Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const getRemainingDays = (voucher) => {
    if (voucher.expiryDate) {
      const expDate = new Date(voucher.expiryDate);
      const today = new Date();
      const diffTime = expDate - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    if (voucher.expiryDays !== undefined && voucher.expiryDays !== null) {
      return Number(voucher.expiryDays);
    }
    return null;
  };

  const filteredVouchers = retailerVouchers.filter(v => {
    const matchesSearch = 
      (v.voucherCode && v.voucherCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.ownerId && v.ownerId.toString().includes(searchTerm));
    
    const selectedOwner = formData.ownerId || retailerId;
    const hasSelectedOwner = selectedOwner && selectedOwner !== "" && selectedOwner !== "-- Choose Retailer --";
    const matchesOwner = !hasSelectedOwner || String(v.ownerId) === String(selectedOwner);

    return matchesSearch && matchesOwner;
  });

  // Calculations tied to filteredVouchers
  const totalPointsAdded = filteredVouchers.reduce((acc, v) => acc + (Number(v.pointsCost) || 0), 0);
  
  const expiringSoonCount = filteredVouchers.filter(v => {
    const remaining = getRemainingDays(v);
    return remaining !== null && remaining >= 0 && remaining <= 30;
  }).length;

  const avgVoucherCost = filteredVouchers.length > 0 ? Math.round(totalPointsAdded / filteredVouchers.length) : 0;

  return (
    <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '32px 40px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', boxSizing: 'border-box' }}>
      
      {/* Top Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Vouchers Section</h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Manage vouchers, imports, and exports for Retailer ID: {retailerId || 'All'}</p>
        </div>

        {/* CSV Import & Export Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={handleExportCSV}
            style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', color: '#334155', padding: '9px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Export CSV
          </button>
          
          <label style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', color: '#334155', padding: '9px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Import CSV
            <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Top Stat Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
            <span>Active Vouchers</span>
            <span>🛡️</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{filteredVouchers.length}</div>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>active records</div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
            <span>Total Points Added</span>
            <span>🪙</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{totalPointsAdded.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>Pts</span></div>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>points</div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
            <span>Expiring Soon</span>
            <span>⏳</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{expiringSoonCount}</div>
          <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>Within the next 30 days</div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
            <span>Avg Voucher Cost</span>
            <span>📊</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{avgVoucherCost.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>Pts</span></div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Calculated average cost</div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Form Card */}
        <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              {editingVoucherId ? 'Edit Voucher' : 'Create Retailer Voucher'}
            </h2>
            <span style={{ backgroundColor: editingVoucherId ? '#fef3c7' : '#ecfdf5', color: editingVoucherId ? '#d97706' : '#047857', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
              {editingVoucherId ? 'Editing' : 'Create'}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '22px' }}>
            {editingVoucherId ? 'Modify details of the existing voucher.' : 'Add a voucher.'}
          </p>

          {statusMessage && (
            <div style={{ padding: '12px', marginBottom: '16px', borderRadius: '8px', fontSize: '13px', backgroundColor: statusMessage.includes('success') ? '#dcfce7' : '#fee2e2', color: statusMessage.includes('success') ? '#166534' : '#991b1b', fontWeight: '500' }}>
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Retailer ID (Owner ID)</label>
              <input 
                type="text" 
                name="ownerId" 
                value={formData.ownerId} 
                readOnly
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#e2e8f0', color: '#475569', fontWeight: '600', cursor: 'not-allowed' }} 
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Voucher Code</label>
                <span onClick={handleAutoGenerate} style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', cursor: 'pointer' }}> Auto Generate</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  name="voucherCode" 
                  value={formData.voucherCode} 
                  onChange={handleChange} 
                  placeholder="e.g. SHOP-2026-X8K" 
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', fontWeight: '600' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Points Cost</label>
              <input 
                type="number" 
                name="pointsCost" 
                value={formData.pointsCost} 
                onChange={handleChange} 
                placeholder="40" 
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expiry Days</label>
              <input 
                type="number" 
                name="expiryDays" 
                value={formData.expiryDays} 
                onChange={handleChange} 
                placeholder="30" 
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }}
              />
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>pick days:</span>
                {['30', '60', '90', '365'].map((days) => (
                  <button 
                    key={days} 
                    type="button"
                    onClick={() => handleQuickPick(days)}
                    style={{ background: formData.expiryDays === days ? '#0f172a' : '#f1f5f9', color: formData.expiryDays === days ? '#fff' : '#475569', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {days === '365' ? '1 Year' : `${days}d`}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button 
                type="submit" 
                disabled={loading}
                style={{ flex: 1, backgroundColor: editingVoucherId ? '#d97706' : '#059669', color: '#fff', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                {loading ? 'Submitting...' : (editingVoucherId ? ' Update Voucher' : ' Create Voucher')}
              </button>

              {editingVoucherId && (
                <button 
                  type="button"
                  onClick={handleCancelEdit}
                  style={{ backgroundColor: '#64748b', color: '#fff', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Vouchers List Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>All Vouchers</h3>
              <span style={{ backgroundColor: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>{filteredVouchers.length} records</span>
            </div>
          </div>

          {/* Search bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
              <input 
                type="text" 
                placeholder="Search code or Owner ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Vouchers Grid */}
          {filteredVouchers.length === 0 ? (
            <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
              <p style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0' }}>No retailer vouchers found.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {filteredVouchers.map((voucher, index) => {
                const voucherId = voucher.id || voucher.voucherId;
                return (
                  <div key={index} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0, fontFamily: 'monospace', letterSpacing: '0.5px' }}>{voucher.voucherCode}</h4>
                        <span style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Active</span>
                      </div>

                      <div style={{ fontSize: '13px', color: '#475569', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Owner ID:</span>
                        <strong style={{ color: '#0f172a' }}>#{voucher.ownerId}</strong>
                      </div>

                      <div style={{ fontSize: '13px', color: '#475569', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Cost:</span>
                        <strong style={{ color: '#0f172a' }}>⭐ {voucher.pointsCost} Points</strong>
                      </div>

                      <div style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Expires:</span>
                        <strong style={{ color: '#0f172a' }}>
                          {voucher.expiryDate ? new Date(voucher.expiryDate).toLocaleDateString() : (voucher.expiryDays ? `${voucher.expiryDays} Days` : 'N/A')}
                        </strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                      <button 
                        onClick={() => handleCopyCode(voucher.voucherCode)}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                      >
                        📋 {copiedCode === voucher.voucherCode ? 'Copied!' : 'Copy Code'}
                      </button>
                      <div style={{ display: 'flex', gap: '8px', color: '#94a3b8' }}>
                        <span onClick={() => handleEditClick(voucher)} style={{ cursor: 'pointer', fontSize: '14px' }} title="Edit">✏️</span>
                        <span onClick={() => handleDeleteClick(voucherId)} style={{ cursor: 'pointer', fontSize: '14px' }} title="Delete">🗑️</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AddVoucherPage;