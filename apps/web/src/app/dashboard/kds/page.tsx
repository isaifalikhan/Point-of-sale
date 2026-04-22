'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, MapPin, ChefHat, Timer, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';

export default function KDSPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await apiClient.get('/orders');
      // Filter out completed or cancelled orders for KDS
      const activeOrders = res.data.filter((o: any) => 
        o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && o.status !== 'READY'
      );
      setOrders(activeOrders);
    } catch (error) {
      console.error('Error fetching KDS orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await apiClient.patch(`/orders/${id}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const updateItemStatus = async (orderId: string, itemId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
    try {
      await apiClient.patch(`/orders/${orderId}/items/${itemId}/status`, { status: nextStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'border-amber-500 bg-amber-50';
      case 'PREPARING': return 'border-blue-500 bg-blue-50';
      case 'READY': return 'border-emerald-500 bg-emerald-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const getElapsedTime = (createdAt: string) => {
    const start = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / 60000); // in minutes
    return `${diff} min`;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Loading Kitchen Queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <ChefHat className="h-6 w-6 text-amber-400" />
          <h1 className="text-2xl font-bold tracking-tight">Kitchen Display System</h1>
        </div>
        <div className="flex items-center gap-6 font-medium">
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-amber-500"></div> 
             Pending ({orders.filter(o => o.status === 'PENDING').length})
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-blue-500"></div> 
             Preparing ({orders.filter(o => o.status === 'PREPARING').length})
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.map(order => (
          <Card key={order.id} className={`shadow-md border-t-8 flex flex-col ${getStatusColor(order.status)} animate-in fade-in zoom-in duration-300`}>
            <CardHeader className="pb-3 px-5 pt-4 bg-white">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-xl text-slate-900 truncate">#{order.orderNumber}</span>
                <span className={`text-sm font-bold flex items-center gap-1 ${parseInt(getElapsedTime(order.createdAt)) > 15 ? 'text-red-500' : 'text-slate-500'}`}>
                  <Timer className="h-4 w-4" /> {getElapsedTime(order.createdAt)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 font-medium pb-2 border-b">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {order.table?.name || 'Quick Service'}
                </span>
                <Badge variant={order.type === 'DINE_IN' ? 'default' : 'secondary'} className="text-xs">
                  {order.type.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-5 py-4 flex-1 bg-white space-y-3">
              {order.items.map((orderItem: any, i: number) => {
                const isItemDone = orderItem.status === 'COMPLETED';
                return (
                <div 
                  key={i} 
                  className={`flex flex-col border-b border-slate-100 pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-slate-50 transition-colors ${isItemDone ? 'opacity-40 grayscale' : ''}`}
                  onClick={() => updateItemStatus(order.id, orderItem.id, orderItem.status || 'PENDING')}
                >
                  <div className="flex items-start gap-3">
                    <span className={`font-bold text-lg w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isItemDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-indigo-700'}`}>
                      {isItemDone ? <CheckCircle2 className="h-4 w-4" /> : orderItem.quantity}
                    </span>
                    <div className={isItemDone ? 'line-through' : ''}>
                      <div className="font-semibold text-slate-800 text-lg leading-tight">{orderItem.item.name}</div>
                      {orderItem.variantName && (
                        <div className="text-xs font-bold text-indigo-600 uppercase tracking-tighter mt-0.5">
                          {orderItem.variantName}
                        </div>
                      )}
                      {orderItem.addonNames && orderItem.addonNames.length > 0 && (
                        <div className="text-[10px] text-slate-500 font-medium mt-1 italic">
                          + {orderItem.addonNames.join(', ')}
                        </div>
                      )}
                      {orderItem.notes && (
                        <p className="text-xs text-red-600 font-bold mt-1 uppercase">*** {orderItem.notes} ***</p>
                      )}
                    </div>
                  </div>
                </div>
              )})}
            </CardContent>
            <CardFooter className="p-0 border-t bg-slate-50">
              {order.status === 'PENDING' ? (
                 <Button 
                   className="w-full rounded-none rounded-b-lg h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg" 
                   onClick={() => updateStatus(order.id, 'PREPARING')}
                 >
                   START PREPARING
                 </Button>
              ) : (
                 <Button 
                   className="w-full rounded-none rounded-b-lg h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg" 
                   onClick={() => updateStatus(order.id, 'READY')}
                 >
                   <CheckCircle2 className="mr-2 h-5 w-5" /> BUMP TO READY
                 </Button>
              )}
            </CardFooter>
          </Card>
        ))}

        {orders.length === 0 && !loading && (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-300">
             <CheckCircle2 className="h-16 w-16 mb-4 opacity-10" />
             <p className="text-xl font-medium">All caught up! No active orders.</p>
          </div>
        )}
      </div>
    </div>
  );
}
