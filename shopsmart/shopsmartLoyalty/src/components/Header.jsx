'use client';

import { useState } from 'react';

export default function Header() {
  // Use a fallback or grab directly from localStorage if available (without fetching via email)
  const [customerName, setCustomerName] = useState(() => {
    const email = localStorage.getItem('user_email');
    return email ? email.split('@')[0] : 'Customer';
  });
  
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const trimmedQuery = query.toLowerCase().trim();
    if (!trimmedQuery) return;

    // Search through all major text blocks and headings on the page
    const elements = document.querySelectorAll('h3, h4, p, span, th, td');
    for (let el of elements) {
      if (el.textContent && el.textContent.toLowerCase().includes(trimmedQuery)) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Apply temporary highlight effect
        el.classList.add('bg-yellow-100', 'transition-colors', 'duration-300');
        setTimeout(() => {
          el.classList.remove('bg-yellow-100');
        }, 2000);
        break; // Stop at the first match
      }
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-8">
        <span className="text-xl font-bold tracking-tight text-indigo-600">ShopSmart</span>
        
        <div className="relative hidden md:block w-96">
          <input 
            type="text" 
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for anything (e.g. VIP, Vouchers, Ledger)..." 
            className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {/* Avatar placeholder with first letter of name */}
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
            {customerName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700">{customerName}</span>
        </div>
      </div>
    </header>
  );
}