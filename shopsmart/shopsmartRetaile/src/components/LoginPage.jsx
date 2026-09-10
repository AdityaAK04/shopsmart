// import React, { useState } from 'react';

// export default function LoginPage({ onLoginSuccess }) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       console.log("Fetching retailers from backend...");
//       const response = await fetch('http://localhost:8080/shopsmart/retailer');
//       if (!response.ok) {
//         throw new Error(`Failed to connect to server (Status: ${response.status})`);
//       }
      
//       const retailers = await response.json();
//       console.log("Retailers fetched:", retailers);

//       // Find the retailer matching name/email and password
//       const matchedRetailer = retailers.find((r) => {
//         const matchesName = 
//           (r.ownerName && r.ownerName.toLowerCase() === username.toLowerCase()) || 
//           (r.ownerEmail && r.ownerEmail.toLowerCase() === username.toLowerCase());
        
//         // Match password (checking both common field variations)
//         const dbPassword = r.ownerPassword !== undefined ? r.ownerPassword : r.password;
//         const matchesPassword = dbPassword === password;

//         return matchesName && matchesPassword;
//       });

//       if (matchedRetailer) {
//         const validId = matchedRetailer.ownerId !== undefined ? matchedRetailer.ownerId : matchedRetailer.id;
//         console.log("Matched retailer ID:", validId);
        
//         // Save to local storage for persistence across reloads if needed
//         localStorage.setItem('retailer_id', validId);
        
//         onLoginSuccess(validId);
//       } else {
//         throw new Error('Invalid username/email or password.');
//       }
//     } catch (err) {
//       console.error("Login error:", err);
//       setError(err.message || 'Login failed. Please check your credentials.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{
//       minHeight: '100vh',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: '#f9fafb',
//       fontFamily: 'sans-serif'
//     }}>
//       <div style={{
//         backgroundColor: '#fff',
//         padding: '40px',
//         borderRadius: '16px',
//         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
//         width: '100%',
//         maxWidth: '400px',
//         border: '1px solid #e5e7eb'
//       }}>
//         <div style={{ textAlign: 'center', marginBottom: '24px' }}>
//           <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '28px' }}>S</span>
//           <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111', margin: '8px 0 0 0' }}>Welcome to ShopSmart</h2>
//           <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>Sign in with your retailer credentials</p>
//         </div>

//         {error && (
//           <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//           <div>
//             <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Owner Name / Email</label>
//             <input 
//               type="text" 
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               placeholder="e.g. aditya" 
//               required
//               style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
//             />
//           </div>

//           <div>
//             <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Password</label>
//             <input 
//               type="password" 
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="••••••••" 
//               required
//               style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
//             />
//           </div>

//           <button 
//             type="submit" 
//             disabled={loading}
//             style={{
//               backgroundColor: '#000',
//               color: '#fff',
//               border: 'none',
//               padding: '12px',
//               borderRadius: '8px',
//               fontSize: '14px',
//               fontWeight: '600',
//               cursor: 'pointer',
//               marginTop: '8px'
//             }}
//           >
//             {loading ? 'Authenticating...' : 'Sign In'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
import React, { useState } from 'react';

export default function LoginPage({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); // Only used for registration
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        // 1. Register in Auth Service (port 8095)
        const authResponse = await fetch('http://localhost:8095/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_name: username,
            user_email: email,
            user_password: password,
            user_role: 'user'
          })
        });

        if (!authResponse.ok) {
          throw new Error('Auth service registration failed.');
        }

        // 2. Save registration data directly to Retailer Service (port 8080)
        const retailerResponse = await fetch('http://localhost:8080/shopsmart/retailer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ownerName: username,
            ownerEmail: email,
            ownerPassword: password
          })
        });

        if (!retailerResponse.ok) {
          throw new Error('Failed to save retailer data to port 8080.');
        }

        alert('Registration successful! Please sign in.');
        setIsRegistering(false); // Switch back to login view
        setPassword('');
      } else {
        // Login Flow
        const authResponse = await fetch('http://localhost:8095/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: username,
            password: password
          })
        });

        if (!authResponse.ok) {
          throw new Error('Invalid email/username or password.');
        }

        const contentType = authResponse.headers.get('content-type');
        let jwtToken = '';
        if (contentType && contentType.includes('application/json')) {
          const authData = await authResponse.json();
          jwtToken = authData.token || authData.jwt || authData;
        } else {
          jwtToken = await authResponse.text();
        }

        localStorage.setItem('jwt_token', jwtToken);

        const retailerResponse = await fetch('http://localhost:8080/shopsmart/retailer', {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!retailerResponse.ok) {
          throw new Error('Authenticated, but failed to fetch retailer profile data.');
        }

        const retailers = await retailerResponse.json();

        const matchedRetailer = retailers.find(
          (r) => 
            (r.ownerName?.toLowerCase() === username.toLowerCase() || 
             r.ownerEmail?.toLowerCase() === username.toLowerCase())
        );

        if (matchedRetailer) {
          const activeOwnerId = matchedRetailer.ownerId || matchedRetailer.id;
          localStorage.setItem('retailer_id', activeOwnerId);
          onLoginSuccess(activeOwnerId);
        } else {
          throw new Error('No retailer profile found matching this account.');
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '28px' }}>S</span>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111', margin: '8px 0 0 0' }}>
            {isRegistering ? 'Create Account' : 'Welcome to ShopSmart'}
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
            {isRegistering ? 'Register your retailer profile' : 'Sign in with your retailer credentials'}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              {isRegistering ? 'Username / Owner Name' : 'Owner Name / Email'}
            </label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isRegistering ? "e.g. aditya" : "e.g. aditya or aditya@example.com"} 
              required
              style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {isRegistering && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. aditya@example.com" 
                required
                style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              required
              style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button 
            type="button"
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}