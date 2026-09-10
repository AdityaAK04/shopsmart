export default function Footer() {
  return (
    <footer className="mt-8 pt-8 border-t border-gray-200 pb-12">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-xs text-gray-600">
        <div>
          <span className="font-bold text-gray-900 text-sm">ShopSmart</span>
          <p className="mt-2 text-[11px] text-gray-500">Empowering shoppers with smarter product categories, discount deals, and rewards.</p>
        </div>
        <div>
          <h5 className="font-bold text-gray-900 mb-2">Deals & Discounts</h5>
          <ul className="space-y-1 text-gray-500">
            <li>Today's Flash Deals</li>
            <li>Clearance Center</li>
            <li>Bundle & Save</li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-gray-900 mb-2">Green Rewards Program</h5>
          <ul className="space-y-1 text-gray-500">
            <li>Eco Friendly Bonus</li>
            <li>Recycle Center</li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-gray-900 mb-2">About ShopSmart</h5>
          <ul className="space-y-1 text-gray-500">
            <li>Careers</li>
            <li>Press Releases</li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-gray-900 mb-2">Merchant Solutions</h5>
          <ul className="space-y-1 text-gray-500">
            <li>Sell on ShopSmart</li>
            <li>Partner Portal</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
