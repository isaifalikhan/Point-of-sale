import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Utensils, LayoutDashboard, Store, Users, LineChart } from 'lucide-react';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-white top-0 sticky z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
          <Utensils className="h-6 w-6 text-indigo-600" />
          <span>RestoOS</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
          <Link href="#features" className="hover:text-slate-900 transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
          <Link href="#testimonials" className="hover:text-slate-900 transition-colors">Testimonials</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Sign in</Link>
          <Link href="/signup">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-b from-white to-slate-50 flex items-center justify-center flex-col text-center px-4">
          <div className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6 animate-fade-in-up">
            🚀 The ultimate platform for modern restaurants
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-tight mb-8">
            Run your entire restaurant on <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">one powerful platform</span>
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
            From point-of-sale and kitchen display to inventory and multi-branch management. RestoOS gives you everything you need to thrive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center mb-16">
            <Link href="/signup">
              <Button size="lg" className="h-14 px-8 text-lg font-medium bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg shadow-indigo-200 transition-all hover:scale-105">
                Start your 14-day free trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-medium rounded-full border-slate-300 hover:bg-slate-100 transition-all">
              Book a Demo
            </Button>
          </div>
          <div className="relative w-full max-w-5xl rounded-2xl p-2 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-2xl overflow-hidden aspect-video">
             <div className="bg-slate-900 absolute inset-1 rounded-xl flex items-center justify-center">
                 <p className="text-slate-500 font-mono text-lg">[ Dashboard Demo Rendering ]</p>
             </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-slate-900">Everything you need to succeed</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Powerful features designed specifically for the unique needs of modern restaurant businesses.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Store, title: 'Smart POS System', desc: 'Fast, reliable point of sale that works on any device. Handle dine-in, takeaway, and delivery seamlessly.' },
                { icon: LayoutDashboard, title: 'Kitchen Display (KDS)', desc: 'Real-time order synchronization with your kitchen. No more lost paper tickets or confusion.' },
                { icon: Users, title: 'Staff & Table Management', desc: 'Visual floor plans, role-based access, and detailed staff performance tracking.' },
                { icon: LineChart, title: 'Actionable Analytics', desc: 'Deep insights into your best-selling items, peak hours, and overall profitability.' },
                { icon: CheckCircle2, title: 'Inventory Control', desc: 'Ingredient-level tracking with automatic deductions and low stock alerts.' },
                { icon: Store, title: 'Multi-Branch Support', desc: 'Manage all your locations from a single, centralized Super Admin dashboard.' },
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-6 text-indigo-600">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-slate-50 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-slate-900">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-600 mb-16 max-w-2xl mx-auto">Choose the perfect plan for your business size. No hidden fees.</p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
              {[
                { name: 'Basic', price: '$49', desc: 'Perfect for small cafes and food trucks.', features: ['1 Branch', 'Basic POS', 'Dashboard Analytics', 'Email Support'] },
                { name: 'Standard', price: '$99', desc: 'Ideal for growing restaurants.', popular: true, features: ['Up to 3 Branches', 'Advanced POS + KDS', 'Inventory Management', 'Priority Support'] },
                { name: 'Enterprise', price: '$199', desc: 'For large chains and franchises.', features: ['Unlimited Branches', 'API Access', 'Custom Integrations', '24/7 Phone Support'] },
              ].map((plan, i) => (
                <div key={i} className={`relative p-8 rounded-3xl bg-white border ${plan.popular ? 'border-indigo-600 shadow-xl' : 'border-slate-200 shadow-md'} flex flex-col`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-semibold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-500 mb-6 min-h-12">{plan.desc}</p>
                  <p className="text-5xl font-bold text-slate-900 mb-8">{plan.price}<span className="text-lg text-slate-500 font-normal">/mo</span></p>
                  
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex gap-3 text-slate-700">
                        <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full h-12 rounded-xl text-lg ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                    Choose {plan.name}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-300 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-xl text-white mb-6">
              <Utensils className="h-6 w-6 text-indigo-500" />
              <span>RestoOS</span>
            </div>
            <p className="text-sm text-slate-400">Making restaurant management seamless and profitable for businesses worldwide.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800 text-sm text-slate-500 text-center">
          &copy; {new Date().getFullYear()} RestoOS Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
