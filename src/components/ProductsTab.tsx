import React, { useState } from 'react';
import { ShoppingCart, Star, Link2, RefreshCw, Layers, Sparkles, TrendingUp } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  inventory: number;
  stripeLink: string;
  affiliatesCount: number;
}

export default function ProductsTab() {
  const [discountActive, setDiscountActive] = useState(true);
  const [products, setProducts] = useState<Product[]>([
    { id: 'pr-1', name: 'AI Mastery Academy Level 1-3 License', price: 499, inventory: 42, stripeLink: 'https://buy.stripe.com/test_ai_mastery', affiliatesCount: 15 },
    { id: 'pr-2', name: 'n8n Enterprise Pipeline Template Suite', price: 299, inventory: 18, stripeLink: 'https://buy.stripe.com/test_n8n_suite', affiliatesCount: 8 },
    { id: 'pr-3', name: '1-on-1 Consultation Call with Ben Angel', price: 950, inventory: 5, stripeLink: 'https://buy.stripe.com/test_consultation', affiliatesCount: 0 }
  ]);

  const [activeUpsell, setActiveUpsell] = useState<'none' | 'oto' | 'checkout'>('oto');

  const handleCopyStripeLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert(`Copied Stripe payment link to clipboard: ${link}`);
  };

  const handleTriggerDiscount = () => {
    setProducts(prev => prev.map(p => ({
      ...p,
      price: discountActive ? Math.round(p.price * 0.8) : Math.round(p.price / 0.8)
    })));
    setDiscountActive(!discountActive);
    alert(discountActive ? "Activated dynamic 24-hour 20% discount across Stripe SKUs!" : "Restored base product prices.");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6" id="products-tab">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            Monetization & Stripe Products Engine
          </h2>
          <p className="text-3xs text-slate-500 uppercase tracking-widest font-mono">Upsell funnels, Stripe checkout links, Inventory tracking, and Affiliate telemetry</p>
        </div>

        <button 
          onClick={handleTriggerDiscount}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold font-sans transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          {discountActive ? "Trigger Dynamic 20% Discount" : "Deactivate Discount Engine"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Products checklist & Links */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">Active Monetizable Products (Stripe SKUs)</h3>
          
          <div className="space-y-3">
            {products.map(p => (
              <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-3xs">
                <div>
                  <h4 className="text-xs font-bold text-slate-850">{p.name}</h4>
                  <p className="text-[10px] text-slate-450 font-mono">Inventory: {p.inventory} seats left | Affiliates: {p.affiliatesCount} active</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="font-mono text-xs font-extrabold text-indigo-600">${p.price} USD</span>
                  <button 
                    onClick={() => handleCopyStripeLink(p.stripeLink)}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-3xs font-bold font-mono text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Link2 className="w-3" /> Stripe Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upsell funnel logic tree map mockup */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">"Upsell Funnel" Logic Trees</h3>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-sans">
            <div className="space-y-2">
              <div 
                onClick={() => setActiveUpsell('checkout')}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${activeUpsell === 'checkout' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-150 text-slate-700'}`}
              >
                📥 Stage 1: Stripe Checkout (Base AI Mastery)
              </div>
              <div className="text-center text-indigo-400 font-bold text-xs">▼</div>
              <div 
                onClick={() => setActiveUpsell('oto')}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${activeUpsell === 'oto' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-150 text-slate-700'}`}
              >
                🔥 Stage 2: One-Time-Offer (OTO) template suite (Add $299)
              </div>
              <div className="text-center text-indigo-400 font-bold text-xs">▼</div>
              <div 
                onClick={() => setActiveUpsell('none')}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${activeUpsell === 'none' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-150 text-slate-700'}`}
              >
                🏁 Stage 3: Thank You page + Affiliate system invitation
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-center pt-2 leading-relaxed font-semibold">
              Click stages to preview client experience redirects. Funnel paths route automatically based on checkout callbacks.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
