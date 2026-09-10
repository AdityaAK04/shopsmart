import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WelcomeBanner from './components/WelcomeBanner';
import PointsOverview from './components/PointsOverview';
import StatsSummary from './components/StatsSummary';
import VipTierProgress from './components/VipTierProgress';
import RedeemVouchers from './components/RedeemVouchers';
import PointsLedger from './components/PointsLedger';
import Footer from './components/Footer';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('user_email') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Grab customer_id from localStorage and map it to accountId
  const [accountId, setAccountId] = useState(localStorage.getItem('customer_id') || 0);
  const [retailerId, setRetailerId] = useState(2); 

  const [refreshKey, setRefreshKey] = useState(0);

  // States for the loyalty account creation popup
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
  const [isCreatingLoyalty, setIsCreatingLoyalty] = useState(false);

  // Check if loyalty account exists whenever accountId changes and user is logged in
  useEffect(() => {
    if (!token || !accountId || accountId === 0 || accountId === '0') return;

    const checkLoyaltyAccount = async () => {
      try {
        const response = await fetch(`http://localhost:8088/shopsmart/loyalty/customer/${accountId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        // If response is not ok (e.g. 400 or 404), the account does not exist
        if (!response.ok) {
          setShowLoyaltyModal(true);
        } else {
          setShowLoyaltyModal(false);
        }
      } catch (err) {
        console.error("Error checking loyalty account existence:", err);
        setShowLoyaltyModal(true);
      }
    };

    checkLoyaltyAccount();
  }, [accountId, token, refreshKey]);

  const handleCreateLoyaltyAccount = async () => {
    setIsCreatingLoyalty(true);
    try {
      const response = await fetch('http://localhost:8088/shopsmart/loyalty', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId: Number(accountId),
          pointsAvail: 100,
          pointsRedeemed: 0,
          tier: "Bronze"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create loyalty account');
      }

      alert('Loyalty account created successfully!');
      setShowLoyaltyModal(false);
      setRefreshKey(prev => prev + 1); // Refresh dashboard components
    } catch (err) {
      console.error("Error creating loyalty account:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsCreatingLoyalty(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Authenticate to get the JWT token
      const response = await fetch('http://localhost:8095/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          password: password
        })
      });

      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const jwtToken = await response.text();

      // 2. Fetch all customers and find the matching record by email
      let numericCustomerId = 0;
      try {
        const custResponse = await fetch('http://localhost:8091/customers', {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (custResponse.ok) {
          const customers = await custResponse.json();
          
          console.log("%c[DEBUG] Fetched Customers List:", "color: #3b82f6; font-weight: bold;", customers);
          
          const matchedCustomer = customers.find(c => 
            (c.customerEmail && c.customerEmail.toLowerCase() === userEmail.toLowerCase()) ||
            (c.customer_email && c.customer_email.toLowerCase() === userEmail.toLowerCase()) ||
            (c.email && c.email.toLowerCase() === userEmail.toLowerCase())
          );

          if (matchedCustomer) {
            numericCustomerId = matchedCustomer.customerId || matchedCustomer.customer_id || matchedCustomer.id || 0;
            console.log(`%c[DEBUG] Match Found! ID: ${numericCustomerId}`, "color: #10b981; font-weight: bold; font-size: 14px;", matchedCustomer);
          } else {
            console.warn("%c[DEBUG] ⚠️ No customer matched the logged-in email:", "color: f59e0b; font-weight: bold;", userEmail);
          }
        } else {
          console.error("%c[DEBUG] ❌ Failed to fetch /customers. Status:", "color: #ef4444; font-weight: bold;", custResponse.status);
        }
      } catch (custErr) {
        console.error("Error fetching customers list:", custErr);
      }

      // 3. Save dynamically to localStorage
      localStorage.setItem('jwt_token', jwtToken);
      localStorage.setItem('user_email', userEmail);
      localStorage.setItem('customer_id', numericCustomerId);

      setToken(jwtToken);
      setAccountId(numericCustomerId);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('customer_id');
    setToken(null);
    setPassword('');
    setAccountId(0);
    setShowLoyaltyModal(false);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Sign in to Loyalty Portal
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="aditdyacgvqdoe@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 relative">
      <Header />
      <div className="max-w-7xl mx-auto px-4 pt-4 flex justify-between items-center">
        <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md font-mono">
          Logged in as: <strong>{userEmail}</strong> | Customer ID: <strong>{accountId}</strong>
        </span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition"
        >
          Logout
        </button>
      </div>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <WelcomeBanner key={`banner-${refreshKey}`} accountId={accountId} retailerId={retailerId} />
        <PointsOverview key={`overview-${refreshKey}`} accountId={accountId} />
        <StatsSummary key={`stats-${refreshKey}`} accountId={accountId} />
        <VipTierProgress key={`vip-${refreshKey}`} accountId={accountId} />
        <RedeemVouchers accountId={accountId} onRedeemSuccess={handleRefresh} />
        
        <PointsLedger key={`ledger-${refreshKey}`} customerId={accountId} />
        
        <Footer />
      </main>

      {/* Popup Modal for Missing Loyalty Account */}
      {showLoyaltyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                !
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Loyalty Account Found</h3>
              <p className="text-sm text-gray-600 mb-6">
                Customer ID <strong>{accountId}</strong> does not have an active loyalty account. Would you like to create one now?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLoyaltyModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isCreatingLoyalty}
                  onClick={handleCreateLoyaltyAccount}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold rounded-xl transition shadow-sm"
                >
                  {isCreatingLoyalty ? 'Creating...' : 'Yes, Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}