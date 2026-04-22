'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Grid, Users, BarChart3, Settings, LogOut, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [businessType, setBusinessType] = useState<'RESTAURANT' | 'CLOTHING'>('RESTAURANT');
  const [userRole, setUserRole] = useState<string>('Admin');
  const isPosMode = pathname.includes('/dashboard/pos');

  useEffect(() => {
    const savedType = localStorage.getItem('businessType') as any;
    if (savedType) setBusinessType(savedType);
    
    const role = localStorage.getItem('userRole');
    if (role) setUserRole(role);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b font-bold text-xl text-indigo-600">
          RestoOS
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium ${pathname === '/dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Home className="h-5 w-5" />
            Overview
          </Link>
          
          <Link 
            href="/dashboard/menu" 
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium ${pathname === '/dashboard/menu' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <List className="h-5 w-5" />
            {businessType === 'RESTAURANT' ? 'Menu' : 'Products'}
          </Link>
          
          {businessType === 'RESTAURANT' && (
            <>
              <Link 
                href="/dashboard/tables" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium ${pathname === '/dashboard/tables' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Grid className="h-5 w-5" />
                Tables
              </Link>
              <Link 
                href="/dashboard/kds" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium ${pathname === '/dashboard/kds' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <span className="h-5 w-5 flex items-center justify-center font-bold text-lg">👩‍🍳</span>
                KDS
              </Link>
            </>
          )}

          {(userRole === 'Admin' || userRole === 'Manager' || !userRole || userRole === 'undefined') && (
            <Link 
              href="/dashboard/inventory" 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium ${pathname === '/dashboard/inventory' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Inventory
            </Link>
          )}

          {(userRole === 'Admin' || userRole === 'Manager' || !userRole || userRole === 'undefined') && (
            <>
              <Link 
                href="/dashboard/staff" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium ${pathname === '/dashboard/staff' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Users className="h-5 w-5" />
                Staff
              </Link>

              <Link 
                href="/dashboard/analytics" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium ${pathname === '/dashboard/analytics' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <BarChart3 className="h-5 w-5" />
                Analytics
              </Link>
            </>
          )}
          
          <div className="pt-4 mt-4 border-t">
            <Link 
              href="/dashboard/pos" 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-bold transition-all ${isPosMode ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105' : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-100'}`}
            >
              <ShoppingCart className="h-5 w-5" />
              Open POS
            </Link>
          </div>
        </nav>
        <div className="p-4 border-t">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors">
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </div>

      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-800">
              {isPosMode ? 'Point of Sale' : 'Dashboard'}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider">
              {businessType}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {!isPosMode && (
               <Link 
                href="/dashboard/pos" 
                className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-semibold hover:bg-emerald-100 transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                POS Mode
              </Link>
            )}
            {isPosMode && (
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-sm font-semibold hover:bg-indigo-100 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Back to Admin
              </Link>
            )}
            <Avatar className="h-9 w-9 border border-indigo-100">
              <AvatarFallback className="bg-indigo-100 text-indigo-700 font-medium">JD</AvatarFallback>
            </Avatar>
            <button className="text-slate-500 hover:text-red-500 transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
