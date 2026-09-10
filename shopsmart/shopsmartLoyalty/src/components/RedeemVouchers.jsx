import React, { useState, useEffect } from 'react';

export default function RedeemVouchers({ accountId = 1, onRedeemSuccess }) {
  const [vouchers, setVouchers] = useState([]);
  const [fetchingVouchers, setFetchingVouchers] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [sortOrder, setSortOrder] = useState('default');

  // Reusable fetch function so we can call it on load AND after redemption
  const fetchAvailableVouchers = async () => {
    try {
      setFetchingVouchers(true);
      const response = await fetch('http://localhost:8089/shopsmart/loyaltyTransaction/vouchers/available');
      
      if (!response.ok) {
        throw new Error('Failed to load vouchers from server');
      }

      const data = await response.json();
      setVouchers(data);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setFetchError(err.message);
    } finally {
      setFetchingVouchers(false);
    }
  };

  useEffect(() => {
    fetchAvailableVouchers();
  }, []);

  // Sort vouchers dynamically based on pointsCost from API
  const sortedVouchers = [...vouchers].sort((a, b) => {
    if (sortOrder === 'asc') return (a.pointsCost || 0) - (b.pointsCost || 0);
    if (sortOrder === 'desc') return (b.pointsCost || 0) - (a.pointsCost || 0);
    return 0;
  });

  const handleRedeem = async (voucher, index) => {
    setLoadingIndex(index);
    try {
      const points = voucher.pointsCost;
      const response = await fetch(`http://localhost:8088/shopsmart/loyalty/customer/${accountId}/redeem-points?points=${points}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to redeem points');
      }

      alert(`Successfully redeemed voucher: ${voucher.voucherCode || 'Voucher'}!`);
      
      // RE-FETCH: Pull fresh available vouchers from backend so the claimed one vanishes
      await fetchAvailableVouchers();
      
      if (onRedeemSuccess) {
        onRedeemSuccess();
      }
    } catch (err) {
      console.error('Redemption error:', err);
      alert(`Error: ${err.message || 'Could not process redemption'}`);
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div id="redeem-section" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6 scroll-mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <span className="text-xs text-indigo-600 font-bold uppercase">Voucher Catalog</span>
          <h3 className="text-xl font-bold text-gray-900">Redeem Vouchers & Instant Perks</h3>
        </div>
        
        {/* Sorting Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Sort by:</span>
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="default">Featured</option>
            <option value="asc">Points: Low to High</option>
            <option value="desc">Points: High to Low</option>
          </select>
        </div>
      </div>

      {/* Loading / Error / Empty States */}
      {fetchingVouchers && (
        <div className="text-center py-8 text-gray-500 text-sm">Loading vouchers from server...</div>
      )}

      {fetchError && (
        <div className="text-center py-8 text-red-500 text-sm">Error: {fetchError}</div>
      )}

      {!fetchingVouchers && !fetchError && sortedVouchers.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">No vouchers available at this time.</div>
      )}

      {/* Horizontal Scrollable Slider */}
      {!fetchingVouchers && !fetchError && sortedVouchers.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-thin scrollbar-thumb-gray-200 snap-x">
          {sortedVouchers.map((v, i) => (
            <div 
              key={v.id || v.voucherId || i} 
              className="min-w-[260px] sm:min-w-[280px] max-w-[280px] border border-gray-200 p-4 rounded-xl flex flex-col justify-between flex-shrink-0 snap-start bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    {v.pointsCost?.toLocaleString() || 0} pts
                  </span>
                  {v.status && (
                    <span className="text-[10px] uppercase font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      {v.status}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-gray-900 line-clamp-1">
                  {v.voucherCode || `Voucher #${v.id || i + 1}`}
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {v.expiryDate 
                    ? `Expires: ${new Date(v.expiryDate).toLocaleDateString()}` 
                    : 'Redeem points to claim this voucher.'}
                </p>
              </div>
              <button 
                disabled={loadingIndex === i}
                onClick={() => handleRedeem(v, i)}
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-semibold py-2.5 rounded-lg transition shadow-sm"
              >
                {loadingIndex === i ? 'Processing...' : 'Redeem Voucher'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}