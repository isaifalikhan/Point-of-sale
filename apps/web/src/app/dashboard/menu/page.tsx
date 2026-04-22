'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit2, Trash2, Loader2, Package, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { apiClient } from '@/lib/api-client';

export default function MenuManagement() {
  const [activeTab, setActiveTab] = useState('items');
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New Confirmation State
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; itemId: string | null }>({ isOpen: false, itemId: null });
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; title: string; description: string; type: 'info' | 'danger' | 'success' | 'warning' }>({ 
    isOpen: false, 
    title: '', 
    description: '', 
    type: 'info' 
  });
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    description: '',
    image: '',
    isAvailable: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catsRes, itemsRes] = await Promise.all([
        apiClient.get('/menu/categories'),
        apiClient.get('/menu/items')
      ]);
      setCategories(catsRes.data);
      setItems(itemsRes.data);
      if (catsRes.data.length > 0 && !formData.categoryId) {
         setFormData(prev => ({ ...prev, categoryId: catsRes.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      price: '',
      description: '',
      image: '',
      isAvailable: true
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      categoryId: item.categoryId,
      price: item.price?.toString() || '0',
      description: item.description || '',
      image: item.image || '',
      isAvailable: item.isAvailable ?? true
    });
    setIsDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = async () => {
    if (!formData.name || !formData.categoryId || !formData.price) {
       setAlertConfig({
         isOpen: true,
         title: 'Missing Information',
         description: 'Please fill in all required fields (Name, Category, and Price) to save this item.',
         type: 'warning'
       });
       return;
    }
    
    try {
      const payload = {
        name: formData.name,
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        description: formData.description,
        image: formData.image,
        isAvailable: formData.isAvailable
      };

      if (editingItem) {
        await apiClient.patch(`/menu/items/${editingItem.id}`, payload);
      } else {
        await apiClient.post('/menu/items', payload);
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving item:', error);
      setAlertConfig({
        isOpen: true,
        title: 'Save Failed',
        description: 'There was an error while saving the menu item. Please try again.',
        type: 'danger'
      });
    }
  };

  const handleToggleAvailability = async (id: string, current: boolean) => {
    try {
      setItems(items.map(i => i.id === id ? { ...i, isAvailable: !current } : i));
      await apiClient.patch(`/menu/items/${id}`, { isAvailable: !current });
    } catch (error) {
      setItems(items.map(i => i.id === id ? { ...i, isAvailable: current } : i));
      console.error('Toggle failed', error);
      alert("Failed to update availability");
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await apiClient.delete(`/menu/items/${id}`);
      setItems(items.filter(i => i.id !== id));
      setConfirmDelete({ isOpen: false, itemId: null });
    } catch (error) {
      console.error('Deletion failed', error);
      setAlertConfig({
        isOpen: true,
        title: 'Delete Failed',
        description: 'We could not delete this item. It might be linked to existing orders.',
        type: 'danger'
      });
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Fetching Menu Catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Menu Management</h1>
          <p className="text-slate-500 mt-1">Organize your categories, items, and variants.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger
            render={
              <Button
                onClick={openCreateDialog}
                className="bg-indigo-600 text-primary-foreground hover:bg-indigo-700 shadow-lg shadow-indigo-100 border-none"
              >
                <Plus className="mr-2 h-4 w-4" /> Add New Item
              </Button>
            }
          />
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Create Menu Item'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex justify-center mb-4">
                 <div 
                   className="h-32 w-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors relative"
                   onClick={() => fileInputRef.current?.click()}
                 >
                    {formData.image ? (
                       <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                       <>
                         <ImageIcon className="h-8 w-8 text-slate-400 mb-2" />
                         <span className="text-[10px] font-bold text-slate-500 uppercase">Upload Image</span>
                       </>
                    )}
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleImageChange}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input 
                  placeholder="e.g. Classic Cheeseburger" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Base Price</Label>
                  <Input 
                    type="number" 
                    placeholder="490" 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm"
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  placeholder="Short description..." 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                <div>
                   <Label className="text-base font-bold">Item Availability</Label>
                   <p className="text-xs text-slate-500">Is this item currently in stock?</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.isAvailable} onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleSaveItem}>
                {editingItem ? 'Save Changes' : 'Create Item'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 shrink-0 flex items-center gap-4">
        <Search className="text-slate-400 h-5 w-5 ml-2" />
        <Input 
          placeholder="Search items by name or category..." 
          className="border-0 shadow-none focus-visible:ring-0"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="items" className="flex gap-2">
             <Package className="h-4 w-4" /> Menu Items
          </TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className={`overflow-hidden group transition-all ${item.isAvailable ? 'hover:border-indigo-200 bg-white' : 'opacity-60 grayscale bg-slate-50'}`}>
                 <div className="h-48 relative overflow-hidden bg-slate-100 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <Package className="h-10 w-10 text-slate-200" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    {!item.isAvailable && (
                       <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <span className="bg-rose-600 text-white font-black px-3 py-1 rounded-full text-xs uppercase tracking-widest shadow-lg">Out of Stock</span>
                       </div>
                    )}
                 </div>

                 <CardContent className="p-4 relative">
                   <div className="flex justify-between items-start mb-1 gap-2">
                     <h3 className={`font-semibold truncate flex-1 ${item.isAvailable ? 'text-slate-900' : 'text-slate-500'}`} title={item.name}>{item.name}</h3>
                     <span className={`font-bold text-sm whitespace-nowrap ${item.isAvailable ? 'text-indigo-600' : 'text-slate-400'}`}>Rs. {item.price}</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mt-2">
                     <span className="text-slate-400">{item.category?.name}</span>
                   </div>
                   
                   <div className="mt-4 pt-4 border-t flex justify-between items-center">
                     {/* Inline Availability Toggle */}
                     <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={item.isAvailable ?? true} onChange={() => handleToggleAvailability(item.id, item.isAvailable ?? true)} />
                          <div className={`w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all ${item.isAvailable ? 'peer-checked:bg-emerald-500' : ''}`}></div>
                        </label>
                        <span className="text-[10px] font-bold text-slate-400">STOCK</span>
                     </div>

                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => openEditDialog(item)}>
                         <Edit2 className="h-4 w-4" />
                       </Button>
                       <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDeleteItem(item.id)}>
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     </div>
                   </div>
                 </CardContent>
              </Card>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 font-medium">No menu items found.</div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Categories</CardTitle>
              <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
            </CardHeader>
            <CardContent>
               <div className="divide-y">
                 {categories.map((cat) => (
                   <div key={cat.id} className="py-4 flex items-center justify-between group">
                     <div>
                        <span className="font-bold text-slate-900">{cat.name}</span>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">ID: {cat.id}</div>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="text-slate-400 text-sm font-medium">{cat.items?.length || 0} items</span>
                        <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 className="h-4 w-4" /></Button>
                     </div>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Premium Confirmation Modals */}
      <ConfirmationModal 
        isOpen={confirmDelete.isOpen}
        onOpenChange={(open) => setConfirmDelete({ ...confirmDelete, isOpen: open })}
        title="Delete Menu Item?"
        description="Are you sure you want to permanently remove this item from your menu? This cannot be undone."
        confirmText="Yes, Delete"
        type="danger"
        onConfirm={() => {
          if (confirmDelete.itemId) handleDeleteItem(confirmDelete.itemId);
        }}
      />

      <ConfirmationModal 
        isOpen={alertConfig.isOpen}
        onOpenChange={(open) => setAlertConfig({ ...alertConfig, isOpen: open })}
        title={alertConfig.title}
        description={alertConfig.description}
        type={alertConfig.type}
        onConfirm={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        confirmText="Okay"
        cancelText="" // Hide cancel for alerts
      />
    </div>
  );
}
