'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  DollarSign, 
  Users, 
  Activity, 
  TrendingUp, 
  Clock, 
  UtensilsCrossed, 
  Shirt,
  Calendar,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function DashboardOverview() {
  const [businessType, setBusinessType] = useState<'RESTAURANT' | 'CLOTHING'>('RESTAURANT');
  const [summary, setSummary] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedType = localStorage.getItem('businessType') as any;
    if (savedType) setBusinessType(savedType);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await apiClient.get('/orders/analytics/summary');
      setSummary(res.data);
      setRecentOrders(res.data.recentOrders || []);
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { title: "Revenue", value: `Rs. ${summary?.totalRevenue?.toLocaleString() || 0}`, icon: DollarSign, color: "bg-emerald-500", trend: "+12.5%", trendUp: true },
    { title: "Orders", value: summary?.totalOrders || 0, icon: Activity, color: "bg-blue-500", trend: "+8.2%", trendUp: true },
    { title: "Staff", value: "Active", icon: Users, color: "bg-indigo-500", trend: "Normal", trendUp: true },
    { title: "Avg Value", value: `Rs. ${summary?.averageOrderValue?.toFixed(0) || 0}`, icon: CreditCard, color: "bg-rose-500", trend: "-2.4%", trendUp: false },
  ];

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Generating Pulse Report...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             {businessType === 'RESTAURANT' ? <UtensilsCrossed className="h-8 w-8 text-primary" /> : <Shirt className="h-8 w-8 text-primary" />}
             Pulse Dashboard
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Welcome back! Here's what's happening at Baba Jani Fast Food.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-full shadow-sm border border-slate-100">
           <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 text-slate-600 text-sm font-bold">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
           </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
        {stats.map((stat, i) => (
          <Card key={i} className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300 premium-shadow border-slate-100/50">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 blur-2xl ${stat.color}`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-xl text-white shadow-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 mb-1">{stat.value}</div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stat.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} flex items-center`}>
                   {stat.trendUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : null}
                   {stat.trend}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <Card className="col-span-4 glass-card border-slate-100/50 premium-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">Revenue Performance</CardTitle>
              <p className="text-sm text-slate-500 font-medium">Daily revenue trends at Baba Jani Fast Food</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-lg">
               <button className="px-3 py-1 text-xs font-bold bg-white shadow-sm rounded-md text-slate-800">Revenue</button>
               <button className="px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">Orders</button>
            </div>
          </CardHeader>
          <CardContent className="h-72 mt-4 px-6 relative">
             <div className="h-full flex items-end gap-3 pb-4">
                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                   <div key={i} className="flex-1 bg-indigo-500/10 rounded-t-lg relative group">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-lg transition-all duration-1000" 
                        style={{ height: `${h}%` }}
                      ></div>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        Rs. {(h * 1500).toLocaleString()}
                      </div>
                   </div>
                ))}
             </div>
          </CardContent>
          <div className="flex justify-between px-12 pb-8 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
             <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </Card>

        <Card className="col-span-3 glass-card border-slate-100/50 premium-shadow overflow-hidden">
          <CardHeader className="border-b border-slate-100/50 bg-slate-50/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-800">Recent Activity</CardTitle>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-100 animate-pulse">
                 • LIVE
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-slate-100/50">
               {recentOrders.map((order, i) => (
                 <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors group cursor-pointer">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white duration-300">
                         <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">#{order.orderNumber}</p>
                        <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{order.type} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                   </div>
                   <div className="text-right">
                     <p className="font-extrabold text-slate-900 text-sm">Rs. {order.totalAmount}</p>
                     <p className={`text-[10px] font-bold ${order.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`}>{order.status}</p>
                   </div>
                 </div>
               ))}
               {recentOrders.length === 0 && (
                 <div className="py-20 text-center text-slate-300 text-xs font-bold uppercase tracking-widest">No recent transactions</div>
               )}
             </div>
             <button className="w-full py-4 text-xs font-bold text-slate-400 hover:text-primary transition-colors hover:bg-slate-50/80 uppercase tracking-widest border-t border-slate-100">
                View All Activity
             </button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mt-8">
         <Card className="glass-card premium-gradient overflow-hidden border-none text-white relative">
            <div className="absolute top-0 right-0 p-8 rotate-12 opacity-10">
               <TrendingUp className="h-32 w-32" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg font-bold opacity-90">Peak Hour Insight</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-4xl font-black mb-2 tracking-tighter">7:00 PM - 9:00 PM</div>
               <p className="text-sm opacity-80 font-medium">Your busiest window for orders. Prepare extra staff for Friday shifts.</p>
               <Button variant="secondary" className="mt-6 font-bold bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-md">
                 Predictive Analysis
               </Button>
            </CardContent>
         </Card>
         
         <Card className="glass-card border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800">
                Top Category (Baba Jani)
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-3xl">
                     🍕
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900">
                       Pizza
                    </h4>
                    <p className="text-sm text-slate-500 font-medium">High volume across all variants</p>
                  </div>
               </div>
               <div className="mt-6 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[85%] rounded-full" />
               </div>
               <p className="text-[10px] font-extrabold text-slate-400 uppercase mt-2">85% of target inventory reached</p>
            </CardContent>
         </Card>

         <Card className="glass-card border-slate-100/50 premium-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800">Staff Status</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {[
                    { name: "Baba Jani Admin", role: "Owner", score: 100, img: "AD" },
                    { name: "Kitchen Lead", role: "Chef", score: 95, img: "KL" },
                  ].map((staff, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{staff.img}</div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{staff.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{staff.role}</p>
                          </div>
                       </div>
                       <div className="text-right font-black text-primary text-sm">{staff.score}%</div>
                    </div>
                  ))}
               </div>
               <button className="w-full mt-6 py-2 text-[10px] font-extrabold text-slate-400 hover:text-primary transition-all uppercase tracking-widest border border-dashed border-slate-200 rounded-lg">
                  Staff Management
               </button>
            </CardContent>
         </Card>
      </div>
    </>
  );
}
