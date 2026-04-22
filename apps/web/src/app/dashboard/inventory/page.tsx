'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { LayoutDashboard, Plus, Search, Package, AlertCircle, ArrowUpRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSkus: 0, lowStockCount: 0, inventoryValue: 0 });
  const [loading, setLoading] = useState(true);
  
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [currentRecipe, setCurrentRecipe] = useState<any[]>([]);
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);
  const [recipeForm, setRecipeForm] = useState({ ingredientId: '', quantity: 1 });

  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedRestockItem, setSelectedRestockItem] = useState<any>(null);
  const [restockAmount, setRestockAmount] = useState<number>(0);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', stockUnit: 'pieces', currentStock: 0, lowStockAlert: 10 });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const [itemsRes, statsRes, menuRes] = await Promise.all([
        apiClient.get('/inventory'),
        apiClient.get('/inventory/stats'),
        apiClient.get('/menu/items')
      ]);
      setItems(itemsRes.data);
      setStats(statsRes.data);
      setMenuItems(menuRes.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipe = async (menuItemId: string) => {
    try {
      const res = await apiClient.get(`/inventory/recipe/${menuItemId}`);
      setCurrentRecipe(res.data);
    } catch (error) {
       console.error("Failed to fetch recipe", error);
    }
  };

  const handleRestock = async () => {
    if (!selectedRestockItem || restockAmount <= 0) return;
    try {
      await apiClient.patch(`/inventory/${selectedRestockItem.id}/stock`, { amount: restockAmount });
      fetchInventory();
      setIsRestockOpen(false);
      setRestockAmount(0);
    } catch (error) {
      console.error("Failed to restock", error);
    }
  };

  const handleLinkIngredient = async () => {
    if (!selectedMenuItem || !recipeForm.ingredientId) return;
    try {
      await apiClient.post(`/inventory/recipe/${selectedMenuItem.id}`, recipeForm);
      fetchRecipe(selectedMenuItem.id);
      setRecipeForm({ ...recipeForm, quantity: 1 });
    } catch (error) {
      console.error("Failed to link ingredient", error);
    }
  };

  const handleAddIngredient = async () => {
    try {
      await apiClient.post('/inventory', newItem);
      fetchInventory();
      setIsAddOpen(false);
      setNewItem({ name: '', stockUnit: 'pieces', currentStock: 0, lowStockAlert: 10 });
    } catch (error) {
      console.error('Failed to create inventory item', error);
    }
  };

  const getTotalCount = () => items.length;
  const getLowStockCount = () => items.filter(i => i.currentStock <= i.lowStockAlert).length;


  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="text-slate-500 mt-1">Track stock levels and manage product variations.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger 
            render={
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="e.g. Tomatoes" />
              </div>
              <div className="space-y-2">
                <Label>Stock Unit</Label>
                <select 
                  className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  value={newItem.stockUnit}
                  onChange={e => setNewItem({...newItem, stockUnit: e.target.value})}
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="grams">Grams (g)</option>
                  <option value="liters">Liters (L)</option>
                  <option value="pieces">Pieces / Units</option>
                  <option value="boxes">Boxes</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Initial Stock</Label>
                   <Input type="number" value={newItem.currentStock} onChange={e => setNewItem({...newItem, currentStock: parseFloat(e.target.value)})} />
                 </div>
                 <div className="space-y-2">
                   <Label>Low Stock Alert At</Label>
                   <Input type="number" value={newItem.lowStockAlert} onChange={e => setNewItem({...newItem, lowStockAlert: parseFloat(e.target.value)})} />
                 </div>
              </div>
              <Button onClick={handleAddIngredient} className="w-full bg-indigo-600">Save Item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
            <CardContent className="p-6">
               <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Total SKUs</p>
               <h3 className="text-3xl font-black mt-1 text-slate-900">{stats.totalSkus}</h3>
            </CardContent>
         </Card>
         <Card className="border-slate-200 shadow-sm border-l-4 border-l-amber-500">
            <CardContent className="p-6">
               <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Low Stock Items</p>
               <h3 className={`text-3xl font-black mt-1 ${stats.lowStockCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>{stats.lowStockCount}</h3>
            </CardContent>
         </Card>
         <Card className="border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
            <CardContent className="p-6">
               <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Inventory Value</p>
               <h3 className="text-3xl font-black mt-1 text-emerald-600">Rs. {stats.inventoryValue}</h3>
            </CardContent>
         </Card>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4">
        <Search className="text-slate-400 h-5 w-5 ml-2" />
        <Input placeholder="Search inventory by name, SKU or category..." className="border-0 shadow-none focus-visible:ring-0" />
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
           <h2 className="text-xl font-black text-slate-900">Live Ingredient Tracking</h2>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="border-b bg-slate-50/50 text-slate-500 text-sm font-medium">
                    <th className="px-6 py-4">Ingredient Name</th>
                    <th className="px-6 py-4">Unit Type</th>
                    <th className="px-6 py-4">Current Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {items.map(item => {
                    const isLowStock = item.currentStock <= item.lowStockAlert;
                    return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-6 py-4 font-semibold text-slate-900">{item.name}</td>
                       <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium uppercase tracking-widest">{item.stockUnit}</span>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                             <span className={`text-lg font-black ${isLowStock ? 'text-rose-600' : 'text-slate-700'}`}>{item.currentStock} <span className="text-xs uppercase tracking-widest opacity-50 font-bold">{item.stockUnit}</span></span>
                             {isLowStock && <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Low Stock Alert!</span>}
                          </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="font-bold text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-all active:scale-95" 
                            onClick={() => {
                              setSelectedRestockItem(item);
                              setRestockAmount(0);
                              setIsRestockOpen(true);
                            }}
                          >
                             Log Restock
                          </Button>
                       </td>
                    </tr>
                 )})}
              </tbody>
           </table>
        </div>
      </Card>

      <div className="mt-12">
        <div className="mb-6">
           <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recipe & Content Management</h2>
           <p className="text-slate-500 mt-1">Link ingredients to menu items for automatic stock deduction.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {menuItems.map(item => (
             <Card key={item.id} className="border-slate-100 hover:border-indigo-200 transition-all cursor-pointer shadow-sm hover:shadow-md" onClick={() => {
                setSelectedMenuItem(item);
                fetchRecipe(item.id);
                setIsRecipeOpen(true);
             }}>
                <CardContent className="p-4 flex items-center justify-between">
                   <div>
                      <h4 className="font-bold text-slate-900">{item.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">Rs. {item.price}</p>
                   </div>
                   <ArrowUpRight className="h-4 w-4 text-slate-300" />
                </CardContent>
             </Card>
           ))}
        </div>
      </div>

      <Dialog open={isRecipeOpen} onOpenChange={setIsRecipeOpen}>
         <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
               <DialogTitle>Recipe: {selectedMenuItem?.name}</DialogTitle>
               <DialogDescription>Define the ingredients and quantities used per serving.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
               <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Select Ingredient</Label>
                        <select 
                          className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                          value={recipeForm.ingredientId}
                          onChange={e => setRecipeForm({...recipeForm, ingredientId: e.target.value})}
                        >
                           <option value="">Choose...</option>
                           {items.map(ing => (
                              <option key={ing.id} value={ing.id}>{ing.name} ({ing.stockUnit})</option>
                           ))}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <Label>Qty per Serving</Label>
                        <Input type="number" value={recipeForm.quantity} onChange={e => setRecipeForm({...recipeForm, quantity: parseFloat(e.target.value)})} />
                     </div>
                  </div>
                  <Button onClick={handleLinkIngredient} className="w-full bg-slate-900 text-white font-bold">Add to Recipe</Button>
               </div>

               <div className="space-y-2">
                  <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest px-1">Current Recipe</h5>
                  <div className="border rounded-xl divide-y divide-slate-100 overflow-hidden">
                     {currentRecipe.map((ri: any) => (
                        <div key={ri.id} className="flex justify-between items-center p-3 text-sm">
                           <span className="font-bold text-slate-700">{ri.ingredient.name}</span>
                           <span className="font-black text-indigo-600">{ri.quantity} <span className="text-[10px] uppercase opacity-50">{ri.ingredient.stockUnit}</span></span>
                        </div>
                     ))}
                     {currentRecipe.length === 0 && <div className="p-8 text-center text-slate-400 italic">No ingredients linked yet.</div>}
                  </div>
               </div>
            </div>
         </DialogContent>
      </Dialog>
      <Dialog open={isRestockOpen} onOpenChange={setIsRestockOpen}>
         <DialogContent className="sm:max-w-[400px] border-none shadow-2xl">
            <DialogHeader className="pb-4">
               <DialogTitle className="text-2xl font-black text-slate-900">Restock Material</DialogTitle>
               <DialogDescription className="text-slate-500 font-medium">Adding stock for <span className="text-indigo-600 font-bold">{selectedRestockItem?.name}</span></DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6 px-2">
               <div className="relative">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 absolute -top-2 left-4 bg-white px-2">Quantity to Add</Label>
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 focus-within:border-indigo-500 transition-all">
                     <Package className="h-6 w-6 text-indigo-500" />
                     <Input 
                        type="number" 
                        value={restockAmount} 
                        onChange={e => setRestockAmount(parseFloat(e.target.value))} 
                        className="text-3xl font-black border-0 bg-transparent focus-visible:ring-0 p-0 h-auto"
                        autoFocus
                     />
                     <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{selectedRestockItem?.stockUnit}</span>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button variant="ghost" onClick={() => setRestockAmount(prev => prev + 5)} className="font-bold h-12 rounded-xl bg-slate-100 hover:bg-slate-200">+5</Button>
                  <Button variant="ghost" onClick={() => setRestockAmount(prev => prev + 10)} className="font-bold h-12 rounded-xl bg-slate-100 hover:bg-slate-200">+10</Button>
               </div>

               <Button 
                  onClick={handleRestock} 
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-lg shadow-indigo-200 rounded-2xl transition-all active:scale-[0.98]"
               >
                  Update Inventory
               </Button>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
