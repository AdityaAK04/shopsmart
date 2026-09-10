import React, { useState, useEffect } from 'react';

export default function WelcomeBanner({ accountId = 1 }) {
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Extract name from localStorage just like Header.jsx
  const [customerName] = useState(() => {
    const email = localStorage.getItem('user_email');
    return email ? email.split('@')[0] : 'Customer';
  });

  useEffect(() => {
    // Fetch loyalty data using the customer endpoint to properly map customerId to loyalty account
    fetch(`http://localhost:8088/shopsmart/loyalty/customer/${accountId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch loyalty account details');
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setLoyaltyData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Loyalty fetch error:', err);
        setLoading(false);
      });
  }, [accountId]);

  const scrollToRedeem = () => {
    const redeemSection = document.getElementById('redeem-section');
    if (redeemSection) {
      redeemSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 p-8 rounded-2xl shadow-sm border border-emerald-100 text-center text-gray-500">
        Loading welcome banner...
      </div>
    );
  }

  const tier = loyaltyData?.tier || 'Bronze';
  const pointsAvail = loyaltyData?.pointsAvail ?? 0;

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm border border-emerald-100">
      <div>
        <div className="flex space-x-2 mb-2">
          <span className="bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-full font-semibold">
            Tier {tier} Member
          </span>
          <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-medium">
            Valid until Dec 31, 2026
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-1 capitalize">
          Welcome to ShopSmart Rewards, {customerName}!
        </h1>
        <p className="text-gray-600 mt-1">
          You're unlocking top-tier perks at ShopSmart. Earn points automatically on every checkout, early flash sales access, and instant voucher offers.
        </p>
      </div>
      <div className="mt-4 md:mt-0 bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-[220px]">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Instant Rewards Available</p>
        <p className="text-2xl font-black text-indigo-600 mt-1">{pointsAvail.toLocaleString()} pts available</p>
        <button 
          onClick={scrollToRedeem}
          className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
        >
          Redeem Points Now
        </button>
      </div>
    </div>
  );
}