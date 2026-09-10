import { useState, useEffect } from 'react';

export default function ProductContent({ selectedShop, onBackToShops }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  // Add Product States
  const [isAdding, setIsAdding] = useState(false);
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [stockLeft, setStockLeft] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit Product Modal States
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editOriginalPrice, setEditOriginalPrice] = useState('');
  const [editDiscount, setEditDiscount] = useState('');
  const [editStockLeft, setEditStockLeft] = useState('');
  const [editStockUsed, setEditStockUsed] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [updating, setUpdating] = useState(false);
// Function to generate and download CSV
  const handleExportCSV = () => {
    if (products.length === 0) {
      alert('No products available to export.');
      return;
    }

    // Define CSV headers
    const headers = ['Product ID', 'Product Name', 'Category', 'Price', 'Original Price', 'Discount (%)', 'Stock Left', 'Stock Used', 'Description'];

    // Map products to CSV rows
    const rows = products.map(p => [
      p.productId,
      `"${(p.productName || '').replace(/"/g, '""')}"`, // Escape quotes for safety
      `"${(p.category || '').replace(/"/g, '""')}"`,
      p.price,
      p.originalPrice || 0,
      p.discount || 0,
      p.stockLeft || 0,
      p.stockUsed || 0,
      `"${(p.description || '').replace(/"/g, '""')}"`
    ]);

    // Combine headers and rows into a single CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedShop.shopName.replace(/\s+/g, '_')}_Inventory.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // Import Loading State
  const [importing, setImporting] = useState(false);

  // Function to handle CSV file parsing and batch import
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

      if (lines.length < 2) {
        alert('The CSV file is empty or missing data rows.');
        return;
      }

      // Skip header row (index 0) and parse the rest
      const rows = lines.slice(1);
      setImporting(true);
      let successCount = 0;

      try {
        for (let line of rows) {
          // Simple CSV line parser handling basic comma separation
          const cols = line.split(',').map(col => col.replace(/^"|"$/g, '').trim());
          
          // Expected CSV format: ProductName, Price, OriginalPrice, Discount, Category, StockLeft, StockUsed, Description
          const [productName, price, originalPrice, discount, category, stockLeft, stockUsed, description] = cols;

          if (!productName || !price) continue; // Skip invalid rows

          const productPayload = {
            productName,
            price: Number(price) || 0,
            originalPrice: originalPrice ? Number(originalPrice) : 0,
            discount: discount ? Number(discount) : 0,
            category: category || 'General',
            description: description || '',
            stockLeft: stockLeft ? Number(stockLeft) : 0,
            stockUsed: stockUsed ? Number(stockUsed) : 0,
            shopId: selectedShop.shopId
          };

          const res = await fetch('http://localhost:8082/shopsmart/product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productPayload),
          });

          if (res.ok) {
            successCount++;
          }
        }

        alert(`Successfully imported ${successCount} products!`);
        fetchProducts(); // Refresh the product grid
      } catch (err) {
        alert('Error during CSV import: ' + err.message);
      } finally {
        setImporting(false);
        e.target.value = ''; // Reset file input
      }
    };

    reader.readAsText(file);
  };
  const fetchProducts = async () => {
    if (!selectedShop) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:8082/shopsmart/product/shop/${selectedShop.shopId}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data || []);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Could not connect to Product Service on port 8082.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedShop]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAdding(true);

    try {
      const res = await fetch('http://localhost:8082/shopsmart/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : 0,
          discount: discount ? Number(discount) : 0,
          category: category || 'General',
          description,
          stockLeft: Number(stockLeft),
          stockUsed: 0,
          shopId: selectedShop.shopId
        }),
      });

      if (!res.ok) throw new Error('Failed to create product');

      alert('Product added successfully!');
      setProductName('');
      setPrice('');
      setOriginalPrice('');
      setDiscount('');
      setCategory('');
      setDescription('');
      setStockLeft('');
      setIsAdding(false);
      fetchProducts();
    } catch (err) {
      alert('Error adding product: ' + err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setUpdating(true);

    try {
      const res = await fetch(`http://localhost:8082/shopsmart/product/${editingProduct.productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: editName,
          description: editDescription,
          price: Number(editPrice),
          originalPrice: editOriginalPrice ? Number(editOriginalPrice) : 0,
          discount: editDiscount ? Number(editDiscount) : 0,
          stockLeft: Number(editStockLeft),
          stockUsed: editStockUsed ? Number(editStockUsed) : 0,
          category: editCategory,
          shopId: selectedShop.shopId
        }),
      });

      if (!res.ok) throw new Error('Failed to update product');

      alert('Product updated successfully!');
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      alert('Error updating product: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm(`Delete product ID #${productId}?`)) return;

    try {
      const res = await fetch(`http://localhost:8082/shopsmart/product/${productId}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete');

      alert('Product deleted!');
      fetchProducts();
    } catch (err) {
      alert('Error deleting product: ' + err.message);
    }
  };

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filtering and Sorting logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.productId).includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'PriceLow') return a.price - b.price;
    if (sortBy === 'PriceHigh') return b.price - a.price;
    if (sortBy === 'DiscountHigh') return (b.discount || 0) - (a.discount || 0);
    if (sortBy === 'NameAZ') return (a.productName || '').localeCompare(b.productName || '');
    if (sortBy === 'Category') return (a.category || '').localeCompare(b.category || '');
    return b.productId - a.productId; // Default: Newest
  });

  const totalValuation = products.reduce((acc, p) => acc + (p.price * (p.stockLeft || 0)), 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fdfdfd', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      
      {/* Top Navigation Bar */}
      <div style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
        <button 
          onClick={onBackToShops}
          style={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
        >
          ← Back to Shops
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>{selectedShop.shopName} Retail Inventory</span>
          
        </div>
      </div>

      <div style={{ maxWidth: '1300px', width: '100%', margin: '0 auto', padding: '32px 24px', flex: 1 }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#111' }}>
                Products Of Shop {selectedShop.shopId}: <span style={{ color: '#4f46e5' }}>{selectedShop.shopName}</span>
              </h1>
              <span style={{ fontSize: '11px', backgroundColor: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: '12px', fontWeight: '600', border: '1px solid #a7f3d0' }}>
                🟢 Active Store
              </span>
            </div>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              📍 {selectedShop.address} &nbsp;•&nbsp; Shop ID: {selectedShop.shopId} &nbsp;•&nbsp; {products.length} items
            </p>
          </div>

        {/* Hidden File Input for CSV Upload */}
            <input 
            type="file" 
            accept=".csv" 
            id="csvFileInput" 
            style={{ display: 'none' }} 
            onChange={handleFileUpload} 
            />
    
           
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
            onClick={handleExportCSV}
            style={{ backgroundColor: '#fff', border: '1px solid #d1d5db', color: '#374151', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
            📤 Export CSV
            </button>
             <button 
            onClick={() => document.getElementById('csvFileInput').click()}
            disabled={importing}
            style={{ backgroundColor: '#fff', border: '1px solid #d1d5db', color: '#374151', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
            📥 {importing ? 'Importing...' : 'Import CSV'}
            </button>
          
            <button 
              onClick={() => setIsAdding(!isAdding)}
              style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)' }}
            >
              {isAdding ? 'Cancel' : '➕ Add Product'}
            </button>
          </div>
        </div>

        {/* Add Product Drawer */}
        {isAdding && (
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '18px' }}>Add New Product</h3>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 220px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Product Name</label>
                <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Price (₹)</label>
                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Original Price (₹)</label>
                <input type="number" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: '1 1 120px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Discount (%)</label>
                <input type="number" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Category</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Electronics" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: '1 1 120px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Stock Left</label>
                <input type="number" value={stockLeft} onChange={(e) => setStockLeft(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: '1 1 100%' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Description</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short product summary..." style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
              </div>
              <div style={{ width: '100%', marginTop: '8px' }}>
                <button type="submit" disabled={adding} style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  {adding ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FULL EDIT POPUP MODAL OVERLAY */}
        {editingProduct && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px', overflowY: 'auto' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ marginTop: 0, color: '#111', fontSize: '20px', marginBottom: '20px' }}>Edit Product {editingProduct.productId}</h3>
              <form onSubmit={handleUpdateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Product Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Description</label>
                  <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 140px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Price (₹)</label>
                    <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: '1 1 140px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Original Price (₹)</label>
                    <input type="number" step="0.01" value={editOriginalPrice} onChange={(e) => setEditOriginalPrice(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: '1 1 120px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Discount (%)</label>
                    <input type="number" step="0.01" value={editDiscount} onChange={(e) => setEditDiscount(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 140px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Stock Left</label>
                    <input type="number" value={editStockLeft} onChange={(e) => setEditStockLeft(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: '1 1 140px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Stock Used</label>
                    <input type="number" value={editStockUsed} onChange={(e) => setEditStockUsed(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: '1 1 180px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Category</label>
                    <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="submit" disabled={updating} style={{ flex: 1, backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    {updating ? 'Updating...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setEditingProduct(null)} style={{ flex: 1, backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', color: '#374151', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search Bar & Filter Pills Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '285px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#9ca3af' }}>🔍</span>
              <input 
                type="text" 
                placeholder="Search by name, ID, or category..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '13px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}
              />
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map((cat) => {
                const count = cat === 'All' ? products.length : products.filter(p => p.category === cat).length;
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      backgroundColor: isActive ? '#4f46e5' : '#f3f4f6',
                      color: isActive ? '#fff' : '#4b5563',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expanded Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', backgroundColor: '#fff', outline: 'none', cursor: 'pointer' }}
            >
              <option value="Newest">Newest Added</option>
              <option value="PriceLow">Price: Low to High</option>
              <option value="PriceHigh">Price: High to Low</option>
              <option value="DiscountHigh">Highest Discount %</option>
              <option value="NameAZ">Product Name (A-Z)</option>
              <option value="Category">Category (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading products inventory...</div>
        ) : error ? (
          <div style={{ color: '#dc2626', textAlign: 'center', padding: '40px' }}>{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
            <p style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>No products found</p>
            <p style={{ fontSize: '13px', margin: 0 }}>Try clearing your search or category filter.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredProducts.map((p) => {
              const isLowStock = p.stockLeft < 10;
              return (
                <div 
                  key={p.productId} 
                  style={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '16px', 
                    padding: '20px', 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Card Top Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', backgroundColor: '#eef2ff', color: '#4f46e5', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                        ID: #{p.productId}
                      </span>
                      {p.category && (
                        <span style={{ fontSize: '11px', backgroundColor: '#f3f4f6', color: '#374151', padding: '3px 8px', borderRadius: '6px', fontWeight: '500' }}>
                          {p.category}
                        </span>
                      )}
                    </div>

                    {/* Product Name & Description */}
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111', margin: '0 0 4px 0' }}>{p.productName}</h3>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px 0', minHeight: '20px' }}>{p.description || 'No description provided'}</p>

                    {/* Pricing */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>₹{p.price}</span>
                      {p.originalPrice > 0 && (
                        <span style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'line-through' }}>₹{p.originalPrice}</span>
                      )}
                      {p.discount > 0 ? (
                        <span style={{ fontSize: '11px', backgroundColor: '#fef2f2', color: '#dc2626', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          {p.discount}% OFF
                        </span>
                      ) : null}
                    </div>

                    {/* Stock Status Indicator */}
                    <div style={{ backgroundColor: isLowStock ? '#fffbeb' : '#f9fafb', border: `1px solid ${isLowStock ? '#fde68a' : '#f3f4f6'}`, padding: '8px 12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#4b5563', fontWeight: '500' }}>Stock Left / Used:</span>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: isLowStock ? '#d97706' : '#059669' }}>
                        {p.stockLeft} / {p.stockUsed || 0}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                    <button 
                      onClick={() => {
                        setEditingProduct(p);
                        setEditName(p.productName || '');
                        setEditDescription(p.description || '');
                        setEditPrice(p.price || '');
                        setEditOriginalPrice(p.originalPrice || '');
                        setEditDiscount(p.discount || '');
                        setEditStockLeft(p.stockLeft || '');
                        setEditStockUsed(p.stockUsed || '');
                        setEditCategory(p.category || '');
                      }}
                      style={{ flex: 1, backgroundColor: '#f9fafb', color: '#374151', border: '1px solid #d1d5db', padding: '8px 0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(p.productId)}
                      style={{ flex: '1', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '8px 0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Footer Info Bar */}
      <div style={{ borderTop: '1px solid #e5e7eb', padding: '20px 32px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#6b7280', flexWrap: 'wrap', gap: '12px' }}>
        
        <div style={{ display: 'flex', gap: '24px' }}>
          <span>{selectedShop.shopName}  Total inventory valuation: <strong style={{ color: '#111' }}>₹{totalValuation.toLocaleString()}</strong></span>
          
        </div>
      </div>

    </div>
  );
}