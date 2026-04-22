'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    businessType: 'RESTAURANT',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await apiClient.post('/auth/signup', formData);
      localStorage.setItem('token', response.data.accessToken);
      // Store business type for UI logic
      localStorage.setItem('businessType', formData.businessType);
      router.push('/dashboard');

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSignup}>
          <CardHeader>
            <CardTitle>Create your Business</CardTitle>
            <CardDescription>Setup your POS SaaS account in minutes.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, businessType: 'RESTAURANT'})}
                  className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${formData.businessType === 'RESTAURANT' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                >
                  <span className="text-2xl">🍽️</span>
                  <span className="font-semibold text-sm">Restaurant</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, businessType: 'CLOTHING'})}
                  className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${formData.businessType === 'CLOTHING' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                >
                  <span className="text-2xl">👕</span>
                  <span className="font-semibold text-sm">Clothing</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input 
                id="businessName" 
                placeholder={formData.businessType === 'RESTAURANT' ? "Pizza Heaven" : "Urban Style"}
                value={formData.businessName} 
                onChange={e => setFormData({...formData, businessName: e.target.value})} 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                required 
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            <div className="text-sm text-center text-gray-500">
              Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login</a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
