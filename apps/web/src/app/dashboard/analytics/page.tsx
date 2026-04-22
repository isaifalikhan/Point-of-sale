'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingCart, 
  Banknote, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  Calendar,
  Filter
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [summaryRes, topItemsRes] = await Promise.all([
        apiClient.get('/orders/analytics/summary'),
        apiClient.get('/orders/analytics/top-items')
      ]);
      setSummary(summaryRes.data);
      setTopItems(topItemsRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Business Analytics</h1>
          <p className="text-slate-500 mt-1">Real-time performance metrics and sales trends.</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-white">
            <Calendar className="mr-2 h-4 w-4" /> Last 30 Days
          </Button>
          <Button variant="outline" size="sm" className="bg-white">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200 shadow-sm overflow-hidden relative group hover:border-indigo-200 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">Rs. {summary?.totalRevenue?.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Banknote className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded mr-2">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +12.5%
              </span>
              <span className="text-slate-400">vs. last month</span>
            </div>
          </CardContent>
          <div className="h-1 absolute bottom-0 left-0 right-0 bg-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </Card>

        <Card className="border-slate-200 shadow-sm overflow-hidden relative group hover:border-emerald-200 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Order Volume</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary?.totalOrders}</h3>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded mr-2">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +8.2%
              </span>
              <span className="text-slate-400">vs. last month</span>
            </div>
          </CardContent>
          <div className="h-1 absolute bottom-0 left-0 right-0 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </Card>

        <Card className="border-slate-200 shadow-sm overflow-hidden relative group hover:border-amber-200 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Avg. Order Value</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">Rs. {summary?.averageOrderValue?.toFixed(0)}</h3>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="flex items-center text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded mr-2">
                <ArrowDownRight className="h-3 w-3 mr-0.5" /> -2.4%
              </span>
              <span className="text-slate-400">vs. last month</span>
            </div>
          </CardContent>
          <div className="h-1 absolute bottom-0 left-0 right-0 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </Card>

        <Card className="border-slate-200 shadow-sm overflow-hidden relative group hover:border-violet-200 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Completed Orders</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary?.completedOrders}</h3>
              </div>
              <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
               <span className="font-bold text-slate-600">{((summary?.completedOrders / summary?.totalOrders) * 100 || 0).toFixed(1)}% Conversion</span>
            </div>
          </CardContent>
          <div className="h-1 absolute bottom-0 left-0 right-0 bg-violet-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
            <div>
              <CardTitle className="text-lg">Revenue History</CardTitle>
              <CardDescription>Daily revenue trends over the last 7 days</CardDescription>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
             <div className="flex flex-col items-center gap-4 text-slate-400">
                <div className="flex items-end gap-3 h-40">
                   {(summary?.chartData || [0, 0, 0, 0, 0, 0, 0]).map((rawVal: number, i: number) => {
                      const maxVal = Math.max(...(summary?.chartData || [100]));
                      const safeMax = maxVal === 0 ? 100 : maxVal;
                      const h = (rawVal / safeMax) * 100;
                      return (
                      <div 
                        key={i} 
                        className="w-8 bg-indigo-500/20 rounded-t-sm relative group cursor-pointer hover:bg-indigo-500/40 transition-colors"
                        style={{ height: `${h || 5}%` }} // fallback height if 0 so it's clickable
                      >
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Rs. {rawVal.toLocaleString()}
                         </div>
                      </div>
                   )})}
                </div>
                <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wider">
                   {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d} className="w-8 text-center">{d}</span>)}
                </div>
             </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-500" />
              Popular Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-slate-100">
                {topItems.map((item, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center font-bold text-indigo-700 text-xs">
                          #{i+1}
                        </div>
                        <div>
                           <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                           <div className="text-xs text-slate-400">{item.count} orders</div>
                        </div>
                     </div>
                     <div className="text-sm font-bold text-slate-600">
                        Rs. {item.revenue.toFixed(0)}
                     </div>
                  </div>
                ))}
                {topItems.length === 0 && (
                  <div className="py-20 text-center text-slate-400">No sales data yet.</div>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
