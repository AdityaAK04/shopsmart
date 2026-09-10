import React, { useState, useEffect } from 'react';

export default function PointsLedger({ customerId }) {
  console.log("Received customerId prop:", customerId);
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Skip fetching if customerId hasn't been passed down yet
    if (!customerId) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('jwt_token');

    fetch(`http://localhost:8088/shopsmart/loyalty/customer/${customerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch account loyalty data');
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.pointsHistory) {
          const rawItems = data.pointsHistory
            .split('|')
            .map((item) => item.trim())
            .filter(Boolean);

          const parsedItems = rawItems.map((desc) => {
            const isAdded = desc.toLowerCase().includes('added');
            const matchPoints = desc.match(/\d+/);
            const pointsNum = matchPoints ? Number(matchPoints[0]) : 0;

            return {
              desc: desc,
              cat: isAdded ? 'Earned' : 'Redeemed',
              isAdded: isAdded,
              pointsNum: pointsNum,
              pts: `${isAdded ? '+' : '-'}${pointsNum} pts`,
            };
          });

          // Calculate running balances working backwards from the current available points
          let tempBal = data.pointsAvail ?? 0;
          const historyWithBalance = new Array(parsedItems.length);

          for (let i = parsedItems.length - 1; i >= 0; i--) {
            const item = parsedItems[i];
            historyWithBalance[i] = {
              ...item,
              bal: `${tempBal} pts`
            };

            // Reverse the transaction effect to find the balance prior to this step
            if (item.isAdded) {
              tempBal -= item.pointsNum;
            } else {
              tempBal += item.pointsNum;
            }
          }

          // Reverse to make it descending order (latest first)
          setLedgerData(historyWithBalance.reverse());
        } else {
          setLedgerData([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [customerId]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6 text-center text-gray-500">
        Loading points history from microservice...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6 text-center text-rose-600">
        Error loading ledger: {error}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Points Activity & Ledger</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b text-gray-400">
              <th className="pb-3 font-semibold">NO.</th>
              <th className="pb-3 font-semibold">ACTIVITY & DESCRIPTION</th>
              <th className="pb-3 font-semibold">CATEGORY</th>
              <th className="pb-3 font-semibold">POINTS DELTA</th>
              <th className="pb-3 font-semibold">CURRENT BALANCE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ledgerData.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500">
                  No activity records found for this account.
                </td>
              </tr>
            ) : (
              ledgerData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-3 text-gray-400 font-medium">#{ledgerData.length - idx}</td>
                  <td className="py-3 font-medium text-gray-900">{row.desc}</td>
                  <td className="py-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full font-medium ${
                        row.isAdded
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {row.cat}
                    </span>
                  </td>
                  <td className={`py-3 font-bold ${row.pts.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {row.pts}
                  </td>
                  <td className="py-3 text-gray-600">{row.bal}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}