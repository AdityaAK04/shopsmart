import React, { useState, useEffect } from 'react';

export default function StatsSummary({ accountId = 1 }) {
  const [statsData, setStatsData] = useState({
    pointsAvail: 0,
    pointsRedeemed: 0,
    tier: 'GOLD'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8088/shopsmart/loyalty/customer/${accountId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch stats data');
        }
        return res.json();
      })
      .then((data) => {
        setStatsData({
          pointsAvail: data.pointsAvail ?? 0,
          pointsRedeemed: data.pointsRedeemed ?? 0,
          tier: data.tier || 'GOLD'
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [accountId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center text-gray-400 col-span-2">
          Loading stats summary...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center text-rose-600 col-span-2">
          Error loading stats: {error}
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: "Available Points", 
      value: `${statsData.pointsAvail.toLocaleString()} pts`, 
      sub: `Current VIP Status: ${statsData.tier}`, 
      badge: "Active Balance",
      badgeColor: "bg-emerald-50 text-emerald-700",
      valueColor: "text-gray-900"
    },
    { 
      label: "Total Points Redeemed", 
      value: `${statsData.pointsRedeemed.toLocaleString()} pts`, 
      sub: "Successfully used on rewards & perks", 
      badge: "Redeemed",
      badgeColor: "bg-rose-50 text-rose-700",
      valueColor: "text-rose-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase">{stat.label}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${stat.badgeColor}`}>
              {stat.badge}
            </span>
          </div>
          <p className={`text-2xl font-bold mt-2 ${stat.valueColor}`}>{stat.value}</p>
          <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}