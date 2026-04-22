'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Loader2, CheckCircle2, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  categoryId: string;
  variants?: { name: string; price: number }[];
  addons?: { name: string; price: number }[];
}

interface CartItem {
  item: MenuItem;
  quantity: number;
  variantName?: string;
  addonNames?: string[];
  totalPrice: number;
}

export default function POSPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<any>('DINE_IN');
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [posUser, setPosUser] = useState<string | null>(null);
  const [pinError, setPinError] = useState('');
  const [processingOrder, setProcessingOrder] = useState(false);

  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'FULL' | 'SPLIT' | 'PARTIAL'>('FULL');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [splitCount, setSplitCount] = useState<number>(2);
  const [partialPayments, setPartialPayments] = useState<{amount: number, method: string}[]>([]);


  // Variant Selection State
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catsRes, itemsRes, branchesRes, tablesRes] = await Promise.all([
        apiClient.get('/menu/categories'),
        apiClient.get('/menu/items'),
        apiClient.get('/branches'),
        apiClient.get('/tables')
      ]);
      setCategories(catsRes.data);
      setItems(itemsRes.data);
      setBranches(branchesRes.data);
      setTables(tablesRes.data);
    } catch (error) {

      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onItemClick = (item: MenuItem) => {
    if (item.variants && item.variants.length > 0) {
      setSelectedItemForModal(item);
      setSelectedVariant(item.variants[0].name);
      setSelectedAddons([]);
    } else {
      addToCart(item);
    }
  };

  const addToCart = (item: MenuItem, variantName?: string, addonNames?: string[]) => {
    let finalPrice = item.price;
    if (variantName && item.variants) {
      const v = item.variants.find(v => v.name === variantName);
      if (v) finalPrice = v.price;
    }
    if (addonNames && item.addons) {
      const extras = item.addons.filter(a => addonNames.includes(a.name));
      finalPrice += extras.reduce((sum, a) => sum + a.price, 0);
    }

    setCart(prev => {
      const existing = prev.find(p => 
        p.item.id === item.id && 
        p.variantName === variantName && 
        JSON.stringify(p.addonNames) === JSON.stringify(addonNames)
      );

      if (existing) {
        return prev.map(p => 
          (p.item.id === item.id && p.variantName === variantName && JSON.stringify(p.addonNames) === JSON.stringify(addonNames)) 
          ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { item, quantity: 1, variantName, addonNames, totalPrice: finalPrice }];
    });
    
    setSelectedItemForModal(null);
  };

  const finalizeOrder = async (paymentsArray: {amount: number, method: string}[]) => {
    if (cart.length === 0 || branches.length === 0) return;
    
    setProcessingOrder(true);
    try {
      await apiClient.post('/orders', {
        type: orderType,
        branchId: branches[0].id,
        tableId: orderType === 'DINE_IN' ? selectedTableId : undefined,
        payments: paymentsArray,


        items: cart.map(c => ({
          itemId: c.item.id,
          quantity: c.quantity,
          variantName: c.variantName,
          addonNames: c.addonNames,
        }))
      });
      
      const orderSnapshot = {
        cart: [...cart],
        subtotal,
        orderType,
        payments: paymentsArray,
        cashier: posUser || 'Staff',
        timestamp: new Date()
      };
      
      setOrderSuccess(orderSnapshot);
      setCart([]);
      setSelectedTableId('');
      setIsPaymentModalOpen(false);
      setAmountTendered('');
      setPartialPayments([]);
      
      const tablesRes = await apiClient.get('/tables');
      setTables(tablesRes.data);


    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Order failed. Please check backend logic.');
    } finally {
      setProcessingOrder(false);
    }
  };

  const updateQuantity = (idx: number, delta: number) => {
    setCart(prev => prev.map((p, i) => {
      if (i === idx) {
        const newQ = p.quantity + delta;
        return newQ > 0 ? { ...p, quantity: newQ } : p;
      }
      return p;
    }));
  };

  const subtotal = cart.reduce((sum, p) => sum + (p.totalPrice * p.quantity), 0);
  const total = subtotal; // Simulating no tax for now as per user request context focusing on completion

  const availableTables = tables.filter(t => t.status === 'AVAILABLE');

  const filteredItems = items.filter(item => 

    (activeCategory === 'All' || item.categoryId === activeCategory) &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Initializing Terminal...</p>
      </div>
    );
  }

  const handlePinSubmit = async () => {
    if (pinInput.length < 4) return;
    try {
      setLoading(true);
      const res = await apiClient.post('/auth/staff/login-pin', { pin: pinInput });
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('userRole', res.data.user?.role || 'Staff');
      setPosUser(res.data.user?.name || 'Staff');
      setIsLocked(false);
      setPinError('');
    } catch (error) {
      setPinError('Invalid PIN code. Try again.');
      setPinInput('');
    } finally {
      setLoading(false);
    }
  };

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-4">
         <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full flex flex-col items-center">
            <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
               <CreditCard className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Unlock Terminal</h2>
            <p className="text-slate-500 text-sm font-bold tracking-widest uppercase mb-8 text-center">Enter 4-Digit Staff PIN</p>
            
            <div className="flex gap-4 mb-8">
               {[0,1,2,3].map(i => (
                 <div key={i} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl font-black ${pinInput.length > i ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-50 border-slate-200'}`}>
                    {pinInput.length > i && <div className="w-3 h-3 bg-white rounded-full"></div>}
                 </div>
               ))}
            </div>
            {pinError && <p className="text-rose-500 text-sm font-bold mb-4">{pinError}</p>}

            <div className="grid grid-cols-3 gap-4 w-full mb-6">
               {[1,2,3,4,5,6,7,8,9].map(num => (
                 <Button key={num} variant="outline" className="h-16 text-2xl font-black rounded-2xl hover:bg-slate-100 border-slate-200" onClick={() => setPinInput(p => (p.length < 4 ? p + num : p))}>
                   {num}
                 </Button>
               ))}
               <Button variant="ghost" className="h-16 text-xl font-black rounded-2xl text-slate-400" onClick={() => setPinInput('')}>C</Button>
               <Button variant="outline" className="h-16 text-2xl font-black rounded-2xl hover:bg-slate-100 border-slate-200" onClick={() => setPinInput(p => (p.length < 4 ? p + '0' : p))}>0</Button>
               <Button variant="ghost" className="h-16 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50" onClick={() => setPinInput(p => p.slice(0, -1))}><Minus className="h-6 w-6" /></Button>
            </div>
            <Button className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-lg font-black uppercase tracking-widest rounded-2xl" disabled={pinInput.length !== 4 || loading} onClick={handlePinSubmit}>
               {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Unlock System'}
            </Button>
         </div>
         <div className="mt-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
            RestoOS Premium POS Enterprise System
         </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 overflow-hidden bg-background">
      {/* Items Section */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
        <div className="bg-white/80 backdrop-blur-md p-4 border-b border-slate-100 flex items-center justify-between gap-4 sticky top-0 z-10 shrink-0">
          <div className="flex bg-slate-100/80 p-1 rounded-full border border-slate-200/50">
             {['DINE_IN', 'TAKEAWAY', 'DELIVERY'].map(t => (
               <Button 
                 key={t}
                 variant={orderType === t ? 'default' : 'ghost'} 
                 size="sm" 
                 onClick={() => setOrderType(t)} 
                 className={`rounded-full px-6 font-bold transition-all ${orderType === t ? 'premium-gradient shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
               >
                 {t === 'DINE_IN' ? 'Dine In' : t === 'TAKEAWAY' ? 'Takeaway' : 'Delivery'}
               </Button>
             ))}
          </div>

          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search items..." 
              className="pl-9 bg-slate-50 border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="p-4 overflow-x-auto shrink-0 border-b bg-white no-scrollbar">
          <div className="flex gap-2">
            <Button 
                variant={activeCategory === 'All' ? 'default' : 'outline'}
                className={`whitespace-nowrap rounded-full font-medium ${activeCategory === 'All' ? 'bg-indigo-600' : 'text-slate-600 border-slate-200'}`}
                onClick={() => setActiveCategory('All')}
            >
                All Items
            </Button>
            {categories.map(cat => (
              <Button 
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                className={`whitespace-nowrap rounded-full font-medium ${activeCategory === cat.id ? 'bg-indigo-600' : 'text-slate-600 border-slate-200'}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredItems.map(item => (
              <Card 
                key={item.id} 
                className="hover-scale group cursor-pointer border-slate-100/50 bg-white premium-shadow overflow-hidden"
                onClick={() => onItemClick(item)}
              >
                <div className="h-40 relative overflow-hidden bg-slate-100">
                   {item.image ? (
                     <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingCart className="h-10 w-10 opacity-20" />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Add to order</span>
                   </div>
                </div>
                <CardContent className="p-4 flex flex-col justify-between">
                  <h3 className="font-bold text-slate-800 leading-snug mb-2 line-clamp-2 h-10">{item.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Variant Available</span>
                    <span className="font-extrabold text-primary">Rs. {item.price > 0 ? item.price : item.variants?.[0]?.price}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-[380px] bg-white border-l shadow-xl flex flex-col shrink-0 relative">
        {orderSuccess && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
             <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 scale-up">
                <CheckCircle2 className="h-10 w-10" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-2">Order Confirmed!</h2>
             <p className="text-slate-500 text-sm">Printing ticket for Kitchen Display System...</p>
          </div>
        )}

        <div className="p-5 premium-gradient flex items-center gap-3 shadow-lg">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg leading-none">Order Basket</h2>
            <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Ref: #POS-{Math.floor(1000 + Math.random() * 9000)}</p>
          </div>
          <span className="ml-auto bg-white text-primary px-3 py-1 rounded-full text-xs font-black shadow-sm">{cart.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 p-8 text-center">
              <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-100">
                <ShoppingCart className="h-10 w-10 opacity-20" />
              </div>
              <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Your basket is currently empty</p>
            </div>
          ) : (
            cart.map((p, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-colors group">
                <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden">
                   {p.item.image ? <img src={p.item.image} className="w-full h-full object-cover" /> : <ShoppingCart className="h-4 w-4 opacity-10" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="truncate pr-2">
                       <div className="font-bold text-slate-800 text-sm truncate">{p.item.name}</div>
                       {p.variantName && <div className="text-[10px] text-indigo-600 font-bold">{p.variantName}</div>}
                    </div>
                    <span className="font-black text-slate-900 text-sm">Rs. {(p.totalPrice * p.quantity).toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 bg-white border border-slate-100 shadow-sm rounded-full p-0.5">
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-slate-100 text-slate-600" onClick={() => updateQuantity(i, -1)}><Minus className="h-3 w-3" /></Button>
                      <span className="w-5 text-center text-xs font-bold text-slate-800">{p.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-slate-100 text-slate-600" onClick={() => updateQuantity(i, 1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-full" onClick={() => setCart(cart.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-slate-50/80 backdrop-blur-md p-6 border-t border-slate-100 mt-auto">
          {orderType === 'DINE_IN' && (
             <div className="mb-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Assign Table</label>
                <select 
                  className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                >
                  <option value="" disabled>Select an available table...</option>
                  {availableTables.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.capacity} seats)</option>
                  ))}
                  {availableTables.length === 0 && <option value="" disabled>No tables available</option>}
                </select>
             </div>
          )}

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-2xl font-black text-slate-900 pt-4">
              <span className="tracking-tighter">TOTAL</span>
              <span className="text-primary truncate ml-2">Rs. {subtotal.toFixed(0)}</span>
            </div>
          </div>

          <div className="grid gap-4">
             <Button 
               className="h-16 font-black text-sm uppercase tracking-widest premium-gradient shadow-lg shadow-indigo-100 border-none rounded-2xl w-full" 
               disabled={cart.length === 0 || processingOrder}
               onClick={() => {
                 setPaymentMode('FULL');
                 setAmountTendered('');
                 setIsPaymentModalOpen(true);
               }}
             >
               {processingOrder ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CreditCard className="mr-2 h-5 w-5" /> Proceed to Payment</>}
             </Button>
          </div>
        </div>
      </div>

      {/* Payment Processing Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">Payment Processing</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
             <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
               {['FULL', 'PARTIAL', 'SPLIT'].map(mode => (
                 <Button 
                   key={mode}
                   variant={paymentMode === mode ? 'default' : 'ghost'} 
                   size="sm" 
                   onClick={() => setPaymentMode(mode as any)} 
                   className={`flex-1 font-bold ${paymentMode === mode ? 'shadow-sm' : 'text-slate-500'}`}
                 >
                   {mode}
                 </Button>
               ))}
             </div>

             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-500">Order Total</span>
                <span className="text-3xl font-black text-slate-900">Rs. {subtotal.toFixed(0)}</span>
             </div>

             {paymentMode === 'FULL' && (
               <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount Tendered (Cash)</label>
                   <Input 
                     type="number" 
                     placeholder="Enter amount given by customer..." 
                     className="h-14 text-xl font-bold"
                     value={amountTendered}
                     onChange={(e) => setAmountTendered(e.target.value)}
                   />
                   {parseFloat(amountTendered) > subtotal && (
                     <div className="flex justify-between items-center text-sm p-3 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-100">
                        <span>Change Due:</span>
                        <span className="text-xl">Rs. {(parseFloat(amountTendered) - subtotal).toFixed(0)}</span>
                     </div>
                   )}
                 </div>
                 <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button 
                      className="h-14 font-black uppercase tracking-widest" variant="outline"
                      disabled={Boolean(amountTendered) && parseFloat(amountTendered) < subtotal}
                      onClick={() => finalizeOrder([{ amount: subtotal, method: 'CASH' }])}
                    >
                      Pay via Cash
                    </Button>
                    <Button 
                      className="h-14 font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => finalizeOrder([{ amount: subtotal, method: 'CARD' }])}
                    >
                      Pay via Card
                    </Button>
                 </div>
               </div>
             )}

             {paymentMode === 'SPLIT' && (
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Split How Many Ways?</label>
                     <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" onClick={() => setSplitCount(Math.max(2, splitCount - 1))}><Minus className="h-4 w-4" /></Button>
                        <span className="text-xl font-black w-12 text-center">{splitCount}</span>
                        <Button variant="outline" size="icon" onClick={() => setSplitCount(splitCount + 1)}><Plus className="h-4 w-4" /></Button>
                     </div>
                  </div>
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex justify-between items-center">
                     <span className="font-bold text-indigo-700">Per Person</span>
                     <span className="text-2xl font-black text-indigo-900">Rs. {(subtotal / splitCount).toFixed(0)}</span>
                  </div>
                  <Button 
                    className="w-full h-14 font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 mt-4"
                    onClick={() => {
                      const splitVal = subtotal / splitCount;
                      const payments = Array(splitCount).fill({ amount: splitVal, method: 'CARD' });
                      finalizeOrder(payments);
                    }}
                  >
                    Confirm Split Payments
                  </Button>
               </div>
             )}

             {paymentMode === 'PARTIAL' && (
               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Add Payment</label>
                    <div className="flex gap-2">
                       <Input 
                         type="number" 
                         placeholder="Amount..." 
                         className="h-12 text-lg font-bold"
                         value={amountTendered}
                         onChange={(e) => setAmountTendered(e.target.value)}
                       />
                       <Button 
                         variant="outline" 
                         className="h-12 px-6 font-bold"
                         onClick={() => {
                           if (!amountTendered || isNaN(parseFloat(amountTendered))) return;
                           setPartialPayments([...partialPayments, { amount: parseFloat(amountTendered), method: 'MIXED' }]);
                           setAmountTendered('');
                         }}
                       >
                         Add
                       </Button>
                    </div>
                  </div>

                  {partialPayments.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {partialPayments.map((p, idx) => (
                        <div key={idx} className="flex justify-between p-2 text-sm font-bold border-b">
                           <span className="text-slate-500">Payment {idx + 1}</span>
                           <span>Rs. {p.amount.toFixed(0)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between p-2 text-sm font-black text-rose-600">
                         <span>Remaining Balance</span>
                         <span>Rs. {Math.max(0, subtotal - partialPayments.reduce((s, p) => s + p.amount, 0)).toFixed(0)}</span>
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full h-14 font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 mt-4"
                    disabled={partialPayments.reduce((s, p) => s + p.amount, 0) < subtotal}
                    onClick={() => finalizeOrder(partialPayments)}
                  >
                    Complete Order
                  </Button>
               </div>
             )}
          </div>
        </DialogContent>
      </Dialog>


      {/* Item Variant Modal */}
      <Dialog open={!!selectedItemForModal} onOpenChange={() => setSelectedItemForModal(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">{selectedItemForModal?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
             {selectedItemForModal?.variants && (
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Size / Option</label>
                  <div className="grid grid-cols-2 gap-3">
                     {selectedItemForModal.variants.map(v => (
                        <Button 
                          key={v.name}
                          variant={selectedVariant === v.name ? 'default' : 'outline'}
                          className={`h-auto py-3 px-4 flex flex-col items-start gap-1 justify-center rounded-xl transition-all ${selectedVariant === v.name ? 'premium-gradient border-none shadow-md ring-2 ring-indigo-500 ring-offset-2' : 'border-slate-100 hover:border-indigo-200'}`}
                          onClick={() => setSelectedVariant(v.name)}
                        >
                           <span className="font-bold text-sm">{v.name}</span>
                           <span className={`text-xs ${selectedVariant === v.name ? 'text-white/80' : 'text-slate-500'}`}>Rs. {v.price}</span>
                        </Button>
                     ))}
                  </div>
               </div>
             )}

             {selectedItemForModal?.addons && selectedItemForModal.addons.length > 0 && (
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customize / Add-ons</label>
                  <div className="space-y-2">
                     {selectedItemForModal.addons.map(a => (
                        <div 
                          key={a.name}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedAddons.includes(a.name) ? 'bg-indigo-50 border-indigo-200' : 'border-slate-100 hover:border-slate-200'}`}
                          onClick={() => {
                            if (selectedAddons.includes(a.name)) {
                              setSelectedAddons(selectedAddons.filter(id => id !== a.name));
                            } else {
                              setSelectedAddons([...selectedAddons, a.name]);
                            }
                          }}
                        >
                           <div className="flex items-center gap-3">
                              <div className={`h-5 w-5 rounded flex items-center justify-center transition-colors ${selectedAddons.includes(a.name) ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white'}`}>
                                 {selectedAddons.includes(a.name) && <Plus className="h-3 w-3" />}
                              </div>
                              <span className="text-sm font-semibold text-slate-800">{a.name}</span>
                           </div>
                           <span className="text-xs font-bold text-slate-500">+Rs. {a.price}</span>
                        </div>
                     ))}
                  </div>
               </div>
             )}
          </div>
          <DialogFooter className="mt-4">
             <Button 
                className="w-full h-14 premium-gradient font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 border-none"
                onClick={() => selectedItemForModal && addToCart(selectedItemForModal, selectedVariant, selectedAddons)}
             >
                Add to Basket • Rs. {(
                  (selectedItemForModal?.variants?.find(v => v.name === selectedVariant)?.price || selectedItemForModal?.price || 0) +
                  (selectedItemForModal?.addons?.filter(a => selectedAddons.includes(a.name))?.reduce((sum, a) => sum + a.price, 0) || 0)
                ).toFixed(0)}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Layout Modal */}
      <Dialog open={!!orderSuccess} onOpenChange={(open) => !open && setOrderSuccess(null)}>
        <DialogContent className="sm:max-w-[400px] border-none bg-transparent shadow-none w-full flex justify-center p-0 no-print">
           <div className="bg-white rounded-t-xl rounded-b flex flex-col w-full relative overflow-hidden shadow-2xl pb-4">
              <div id="printable-receipt" className="bg-white text-black p-8 font-mono text-sm leading-tight flex flex-col w-full min-h-full">
                 <div className="text-center pb-4 border-b border-dashed border-slate-300 mb-4">
                    <h2 className="text-xl font-black uppercase mb-1">RestoOS Kitchen</h2>
                    <p className="text-xs text-slate-500">123 Culinary Drive, Food City</p>
                    <p className="text-xs text-slate-500">Tel: +1 234 567 8900</p>
                 </div>
                 
                 <div className="flex justify-between text-xs mb-2">
                    <span>Date: {orderSuccess?.timestamp?.toLocaleDateString()}</span>
                    <span>Time: {orderSuccess?.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                 </div>
                 <div className="flex justify-between text-xs mb-4 pb-4 border-b border-dashed border-slate-300">
                    <span>Cashier: {orderSuccess?.cashier}</span>
                    <span>{orderSuccess?.orderType?.replace('_', ' ')}</span>
                 </div>

                 <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-dashed border-slate-300">
                    <div className="flex justify-between font-bold text-xs mb-1">
                       <span>ITEM</span>
                       <span>AMT</span>
                    </div>
                    {orderSuccess?.cart?.map((c: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs items-start">
                         <div className="flex flex-col pr-4">
                            <span className="font-bold">{c.quantity}x {c.item.name}</span>
                            {c.variantName && <span className="text-[10px] text-slate-500 ml-4">- {c.variantName}</span>}
                            {c.addonNames?.map((a: string) => <span key={a} className="text-[10px] text-slate-500 ml-4">+ {a}</span>)}
                         </div>
                         <span className="font-bold whitespace-nowrap">Rs. {c.totalPrice * c.quantity}</span>
                      </div>
                    ))}
                 </div>

                 <div className="space-y-1 mb-4 pb-4 border-b border-dashed border-slate-300 text-xs text-right">
                    <div className="flex justify-between">
                       <span className="font-bold">SUBTOTAL</span>
                       <span>Rs. {orderSuccess?.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                       <span>TAX (0%)</span>
                       <span>Rs. 0.00</span>
                    </div>
                    <div className="flex justify-between text-lg font-black mt-2 pt-2 border-t border-slate-200">
                       <span>TOTAL</span>
                       <span>Rs. {orderSuccess?.subtotal?.toFixed(2)}</span>
                    </div>
                 </div>

                 <div className="text-xs space-y-1 mb-6 text-slate-500">
                    {orderSuccess?.payments?.map((p: any, i: number) => (
                       <div key={i} className="flex justify-between">
                          <span>TENDERED ({p.method})</span>
                          <span>Rs. {p.amount.toFixed(2)}</span>
                       </div>
                    ))}
                    <div className="flex justify-between font-bold text-black mt-1">
                       <span>CHANGE</span>
                       <span>Rs. {Math.max(0, (orderSuccess?.payments?.reduce((s:number,p:any)=>s+p.amount,0) || 0) - orderSuccess?.subtotal).toFixed(2)}</span>
                    </div>
                 </div>

                 <div className="text-center text-xs text-slate-500 space-y-1 mt-auto pt-8">
                    <div className="font-bold text-black uppercase tracking-widest text-sm mb-2">Thank you!</div>
                    <div className="border-t border-slate-200 w-1/2 mx-auto mb-1"></div>
                    <p>Tell us how we did at feedback.restoos.com</p>
                 </div>
              </div>
              <div className="absolute top-4 right-4 print:hidden">
                 <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-slate-100 border-none shadow text-slate-500 hover:text-slate-900" onClick={() => setOrderSuccess(null)}>
                    <Trash2 className="h-4 w-4" />
                 </Button>
              </div>
           </div>
           <div className="mt-4 flex gap-4 w-full">
              <Button 
                 className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 font-black uppercase tracking-widest text-white rounded-xl shadow-xl border-none"
                 onClick={() => window.print()}
              >
                 <Printer className="mr-2 h-5 w-5" /> Print Receipt
              </Button>
              <Button 
                 variant="outline"
                 className="h-14 px-8 font-black uppercase tracking-widest rounded-xl bg-white text-slate-800"
                 onClick={() => setOrderSuccess(null)}
              >
                 Done
              </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
