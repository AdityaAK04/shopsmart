import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PointsOverview({ accountId = 1 }) {
  const [fullChartData, setFullChartData] = useState([]);
  const [pointsAvail, setPointsAvail] = useState(0);
  const [pointsRedeemed, setPointsRedeemed] = useState(0);
  const [tier, setTier] = useState('GOLD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recordLimit, setRecordLimit] = useState('All');

  useEffect(() => {
    fetch(`http://localhost:8088/shopsmart/loyalty/customer/${accountId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch points overview data');
        }
        return res.json();
      })
      .then((data) => {
        setPointsAvail(data.pointsAvail || 0);
        setPointsRedeemed(data.pointsRedeemed || 0);
        setTier(data.tier || 'GOLD');

        if (data && data.pointsHistory) {
          let runningBalance = 0;
          const parsedHistory = data.pointsHistory
            .split('|')
            .map((item, index) => {
              const desc = item.trim();
              if (!desc) return null;

              const lowerDesc = desc.toLowerCase();
              const isRedemption = lowerDesc.includes('redeem') || lowerDesc.includes('deduct') || lowerDesc.includes('spent');
              const matchPoints = desc.match(/\d+/);
              const pointsNum = matchPoints ? parseInt(matchPoints[0], 10) : 0;

              runningBalance += isRedemption ? -pointsNum : pointsNum;

              return {
                index: index + 1,
                name: `${index + 1}`,
                balance: runningBalance,
                delta: pointsNum,
                type: isRedemption ? 'Redeemed' : 'Earned',
                description: desc
              };
            })
            .filter(Boolean);

          // Ensure data is in ascending order
          setFullChartData(parsedHistory);
        } else {
          setFullChartData([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [accountId]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6 text-center text-gray-400">
        Loading chart...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6 text-center text-rose-600">
        Error loading chart: {error}
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isEarned = data.type === 'Earned';
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-xs z-50">
          <p className="font-bold text-gray-900 mb-1">{data.description}</p>
          <p className={`font-semibold ${isEarned ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isEarned ? `+${data.delta} pts Earned` : `-${data.delta} pts Redeemed`}
          </p>
          <p className="text-gray-400 mt-1">Balance: {data.balance} pts</p>
        </div>
      );
    }
    return null;
  };

  // Uniform size for both green and red dots
  const CustomizedDot = (props) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;
    const isRedeemed = payload.type === 'Redeemed';
    const color = isRedeemed ? '#f43f5e' : '#059669';

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4.5}
        fill="#ffffff"
        stroke={color}
        strokeWidth={2.5}
      />
    );
  };

  const CustomizedActiveDot = (props) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;
    const isRedeemed = payload.type === 'Redeemed';
    const color = isRedeemed ? '#f43f5e' : '#059669';

    return (
      <circle
        cx={cx}
        cy={cy}
        r={7}
        fill="#ffffff"
        stroke={color}
        strokeWidth={3}
      />
    );
  };

  // Filter records based on selected limit (5, 10, 15, 20, All)
  const displayedData = recordLimit === 'All' 
    ? fullChartData 
    : fullChartData.slice(0, recordLimit);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Points Balance & Trajectory</span>
          <h2 className="text-3xl font-black text-gray-900 mt-1">
            {pointsAvail.toLocaleString()} <span className="text-sm font-normal text-gray-500">pts ({tier} Tier)</span>
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 text-xs font-medium text-gray-600">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
              <span>Earned / Balance</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              <span>Redeemed ({pointsRedeemed})</span>
            </span>
          </div>

          {/* Record Count Filter Buttons */}
          <div className="flex space-x-1 bg-gray-50 p-1 rounded-lg border text-xs font-semibold">
            {[5, 10, 15, 20, 'All'].map((limit) => (
              <button
                key={limit}
                onClick={() => setRecordLimit(limit)}
                className={`px-3 py-1 rounded-md transition-all ${
                  recordLimit === limit
                    ? 'bg-white shadow-sm text-emerald-600 font-bold'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                {limit}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-64 w-full bg-gradient-to-t from-emerald-50/20 to-transparent rounded-xl p-2 border border-gray-100">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} />
            <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#059669" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#colorBalance)" 
              dot={<CustomizedDot />}
              activeDot={<CustomizedActiveDot />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}