'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save, Building, User, Lock, Bell, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  const [businessType, setBusinessType] = useState<'RESTAURANT' | 'CLOTHING'>('RESTAURANT');

  useEffect(() => {
    const savedType = localStorage.getItem('businessType') as any;
    if (savedType) setBusinessType(savedType);
  }, []);

  const handleToggleBusinessType = () => {
    const newType = businessType === 'RESTAURANT' ? 'CLOTHING' : 'RESTAURANT';
    setBusinessType(newType);
    localStorage.setItem('businessType', newType);
    window.location.reload(); // To refresh branding across app
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account, business profile, and application preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-slate-100 p-1 mb-6">
          <TabsTrigger value="profile" className="flex gap-2">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="business" className="flex gap-2">
            <Building className="h-4 w-4" /> Business
          </TabsTrigger>
          <TabsTrigger value="security" className="flex gap-2">
            <Lock className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex gap-2">
            <Globe className="h-4 w-4" /> Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and how others see you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue="Admin User" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input defaultValue="admin@pos.com" disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio/Notes</Label>
                <textarea className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Optional notes about your role..."></textarea>
              </div>
              <Button className="bg-indigo-600">
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Business Configuration</CardTitle>
              <CardDescription>Manage your business type and global settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-indigo-900">Current Industry: {businessType}</div>
                    <div className="text-xs text-indigo-700">Changing this will update terminology (Menu vs products) across the app.</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleToggleBusinessType} className="bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
                  Switch to {businessType === 'RESTAURANT' ? 'Clothing' : 'Restaurant'}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input defaultValue="Global POS Demo" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <select className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tax Rate (%)</Label>
                    <Input type="number" defaultValue="10" />
                  </div>
                </div>
              </div>
              <Button className="bg-indigo-600">
                <Save className="mr-2 h-4 w-4" /> Update Business Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>Secure your account with a strong password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" />
              </div>
              <Button className="bg-indigo-600">Change Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>Customize your dashboard experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="text-sm font-medium">Order Notifications</div>
                    <div className="text-xs text-slate-500">Enable sound for new incoming orders</div>
                  </div>
                </div>
                <div className="h-6 w-11 rounded-full bg-emerald-500 p-1 cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-white ml-auto"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
