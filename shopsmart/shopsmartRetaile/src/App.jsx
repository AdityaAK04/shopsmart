import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RetailersContent from './components/RetailersContent';
import AddVoucherPage from './components/AddVoucherPage';
import ShopView from './components/ShopView'; 
import ProductContent from './components/ProductContent';
import LoginPage from './components/LoginPage';
import ProfileRetailer from './components/ProfileRetailer';

function App() {
  const [retailerId, setRetailerId] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [selectedShop, setSelectedShop] = useState(null);
  const [profileImage, setProfileImage] = useState(null); // Shared header profile image state

  const handleLoginSuccess = (assignedId) => {
    setRetailerId(assignedId);
    setCurrentView('home');
    setSelectedShop(null);
  };

  const handleLogout = () => {
    setRetailerId(null);
    setSelectedShop(null);
    setProfileImage(null); // Clear image on logout
  };

  // Fetch the MongoDB profile image whenever retailer logs in or changes
  useEffect(() => {
    if (retailerId) {
      fetch(`http://localhost:8080/shopsmart/retailer/${retailerId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.profileImage) {
            setProfileImage(data.profileImage);
          }
        })
        .catch(err => console.error('Error fetching header profile image:', err));
    }
  }, [retailerId]);

  if (!retailerId) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Handle global header navigation changes uniformly
  const handleViewChange = (view) => {
    setSelectedShop(null); // Always clear selected shop when switching views via header
    setCurrentView(view);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', fontFamily: 'sans-serif' }}>
      <Header 
        onViewChange={handleViewChange} 
        currentView={currentView} 
        onLogout={handleLogout} 
        profileImage={profileImage} // Pass the dynamic MongoDB image to the header
      />
      
      {/* View Router */}
      {selectedShop ? (
        <ProductContent 
          selectedShop={selectedShop} 
          onBackToShops={() => setSelectedShop(null)} 
        />
      ) : (
        <>
          {currentView === 'home' && <RetailersContent retailerId={retailerId} onViewChange={handleViewChange} />}
          {currentView === 'shop' && (
            <ShopView 
              retailerId={retailerId} 
              onSelectShop={(shop) => setSelectedShop(shop)} 
            />
          )}
          {currentView === 'add-voucher' && <AddVoucherPage retailerId={retailerId} />}
          {currentView === 'profile' && (
            <ProfileRetailer 
              onViewChange={handleViewChange} 
              retailerId={retailerId} 
              onImageUpdate={(newImg) => setProfileImage(newImg)} // Instantly updates header when profile image changes
            />
          )}
        </>
      )}
    </div>
  );
}

App.displayName = 'App';

export default App;