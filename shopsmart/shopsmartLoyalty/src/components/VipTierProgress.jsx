import React, { useState, useEffect } from 'react';

export default function VipTierProgress({ accountId = 1 }) {
  const [currentTier, setCurrentTier] = useState("GOLD");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];

  useEffect(() => {
    // FIX: Use the /customer/ endpoint since accountId is the customerId
    fetch(`http://localhost:8088/shopsmart/loyalty/customer/${accountId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch loyalty account details');
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.tier) {
          setCurrentTier(data.tier.toUpperCase());
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [accountId]);

  const activeIdx = tiers.findIndex(
    (t) => t.toUpperCase() === currentTier || t.toUpperCase().includes(currentTier)
  );
  const validActiveIdx = activeIdx !== -1 ? activeIdx : 2;

  // Calculate fill percentage for the progress line
  const progressPercentage = (validActiveIdx / (tiers.length - 1)) * 100;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6 text-center text-gray-500">
        Loading VIP Tier progress...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6 text-center text-rose-600">
        Error loading VIP tier: {error}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900">VIP Tier Progress & Privileges</h3>
        <span className="text-xs text-gray-500">Tier ends date: Dec 31, 2026</span>
      </div>
      <div className="relative flex items-center justify-between my-8 px-6">
        {/* Background gray track line */}
        <div className="absolute left-6 right-6 h-1 bg-gray-100 z-0"></div>
        
        {/* Active filled green progress line */}
        <div
          className="absolute left-6 h-1 bg-emerald-600 z-0 transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>

        {tiers.map((tier, idx) => {
          const isCurrent = idx === validActiveIdx;
          const isPassed = idx <= validActiveIdx;
          return (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isPassed ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {idx + 1}
              </div>
              <span className="text-xs font-medium text-gray-700 mt-2 text-center">
                {tier} {isCurrent && <span className="block text-[10px] text-emerald-600 font-bold">(Current)</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}