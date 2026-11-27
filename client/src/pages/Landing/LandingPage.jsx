import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Boxes,
  Factory,
  Receipt,
  Users,
  Smartphone,
  ChevronRight,
  Sparkles,
  BarChart3,
  Scale,
  Award,
  Globe
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'admin',
      title: 'Admin / Manager',
      user: 'Dhivyasri M',
      icon: ShieldCheck,
      color: 'from-purple-500 to-indigo-600',
      description: 'Overall governance, sales order approval, dispatch verification, stock oversight, and audit logs.',
      badge: 'Full Access',
    },
    {
      id: 'salesman',
      title: 'Field Salesman',
      user: 'K. Ramanathan',
      icon: Smartphone,
      color: 'from-amber-500 to-orange-600',
      description: 'Offline-ready mobile order capture, live customer credit verification, and instant catalogue.',
      badge: 'Mobile Optimized',
    },
    {
      id: 'supervisor',
      title: 'Production Supervisor',
      user: 'M. Selvam',
      icon: Factory,
      color: 'from-emerald-500 to-teal-600',
      description: 'Standard BOM batch execution, raw material deduction, yield monitoring, and wastage logging.',
      badge: 'Shopfloor',
    },
    {
      id: 'auditor',
      title: 'Accountant / Auditor',
      user: 'V. Jayanthi CA',
      icon: Receipt,
      color: 'from-blue-500 to-cyan-600',
      description: 'GST-compliant tax invoices, payment receipts, 30/60/90-day ageing analysis, and credit notes.',
      badge: 'Finance & Tax',
    },
    {
      id: 'owner',
      title: 'Business Owner',
      user: 'S. Murugan',
      icon: TrendingUp,
      color: 'from-rose-500 to-pink-600',
      description: 'High-level business intelligence, unit profitability, cash velocity, and capital allocation.',
      badge: 'Executive',
    },
  ];

  const metrics = [
    { label: 'Standard Batch Size', val: '200 pkts', note: 'Standard BOM output' },
    { label: 'Actual Batch Yield', val: '188 pkts', note: '-6.0% yield variance' },
    { label: 'Unit Manufacturing Cost', val: '₹31.14', note: 'Batch cost: ₹5,855' },
    { label: 'Selling Price & Margin', val: '₹50.00', note: '37.7% gross margin' },
    { label: 'Dispatched to Retailer A', val: '150 pkts', note: 'Gross: ₹7,875' },
    { label: 'Shortage (Distributor B)', val: '32 pkts', note: 'Stock: 88, Ordered: 120' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-primary-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-black text-2xl">
              🥨
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-2">
                Sri Murukku Foods
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                  ERP 2026
                </span>
              </span>
              <p className="text-xs text-slate-500">Order-to-Audit Management System</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-primary-600 transition-colors">Key Modules</a>
            <a href="#roles" className="hover:text-primary-600 transition-colors">5 Role Dashboards</a>
            <a href="#benchmark" className="hover:text-primary-600 transition-colors">Benchmark Problem</a>
            <a href="#architecture" className="hover:text-primary-600 transition-colors">Architecture</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-primary-600 hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/25 transition-all flex items-center gap-2"
            >
              <span>Launch ERP</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-purple-50/50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 text-purple-700 text-xs font-semibold mb-6 border border-purple-200">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>NIT Tiruchirappalli Winter Internship 2026 Problem Statement</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Traditional Food Craft. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600">
              Enterprise ERP Precision.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            The complete <strong>Order-to-Audit Management System</strong> built specifically for small-scale South Indian food manufacturers. From dynamic BOM batch costing and real-time yield variance tracking to GST e-invoicing and offline field sales capture.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 shadow-xl shadow-primary-500/25 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>Sign In to Live Portal</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3.5 rounded-2xl text-base font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2"
            >
              <span>Explore Dashboard (Direct)</span>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Neon PostgreSQL ACID
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Decimal Precision (No Float Drift)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> English & தமிழ் Bilingual
            </span>
          </div>
        </div>
      </section>

      {/* Live Benchmark Strip */}
      <section id="benchmark" className="bg-slate-900 text-white py-12 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Validated Benchmark Dataset
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              Sri Murukku Foods (Trichy) Operational Truth
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {metrics.map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                <div className="text-xs text-slate-400">{m.label}</div>
                <div className="text-2xl font-black text-white mt-1 font-mono tracking-tight">{m.val}</div>
                <div className="text-[11px] text-primary-400 mt-1 font-medium">{m.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Role Dashboards Showcase */}
      <section id="roles" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Role-Based Experience
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Five Dedicated Workspaces for Every Food Factory Persona
            </h2>
            <p className="mt-4 text-slate-600 text-sm">
              Each user operates with strict Role-Based Access Control (RBAC), customized workflows, and targeted KPIs.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.id}
                  className="p-6 rounded-2xl border border-slate-200/80 hover:border-primary-500/50 bg-slate-50/50 hover:bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${r.color} flex items-center justify-center text-white shadow-md`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200">
                        {r.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                      {r.title}
                    </h3>
                    <div className="text-xs font-medium text-slate-500 mb-3">
                      Benchmark User: <span className="text-slate-800 font-semibold">{r.user}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {r.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/login?role=${r.id}`}
                      className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    >
                      <span>Simulate this Role</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Quick Demo Card */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-primary-300 bg-primary-50/40 flex flex-col justify-between">
              <div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  Instant Test Login
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-4">
                  1-Click Role Switcher
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Switch instantly between all 5 roles on the login page or top navigation bar without typing credentials.
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Go to Quick Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture & Feature Highlights */}
      <section id="architecture" className="py-20 bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                Core Engineering
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
                Engineered for Rigorous Audit Compliance & Shopfloor Realities
              </h2>
              <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                Small-scale food manufacturing requires strict accounting precision, raw material tracking, and low-latency mobile order capture.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Dynamic BOM Costing with Overhead Allocation</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Standard BOM allocates rice flour, cooking oil, spices, pouches, cartons, direct labor, and electricity/gas to calculate accurate per-unit costs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Tamil Nadu GST E-Invoicing</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Automatic 2.5% CGST + 2.5% SGST for intrastate orders, 5% IGST for interstate, HSN code tracking, and digital QR code verification.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Offline Field Sales & Automatic Sync</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Sales reps capture orders in low-connectivity retail shops. Orders queue in localStorage and sync idempotently to PostgreSQL upon reconnection.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-2xl border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
                <span className="text-slate-400 font-mono">POST /api/v1/production/runs</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                  ACID Atomic
                </span>
              </div>

              <div className="mt-4 font-mono text-xs text-slate-300 space-y-2">
                <p className="text-primary-400">// 11-Step Atomic Production Transaction</p>
                <p>1. Deduct 40.0 kg Rice Flour (Closing: 120.0 kg)</p>
                <p>2. Deduct 10.5 L Cooking Oil (Closing: 19.5 L, +5% var)</p>
                <p>3. Deduct 1.2 kg Spice Mix (Closing: 3.8 kg)</p>
                <p>4. Deduct 194 pcs Pouches (Closing: 306 pcs)</p>
                <p>5. Deduct 9 pcs Cartons (Closing: 21 pcs - LOW STOCK)</p>
                <p className="text-emerald-400">6. Credit +188 pkts Murukku to Finished Goods</p>
                <p>7. Post Cost Breakdown: RM ₹3,435 + Pkg ₹620 + Lab ₹1,200 + Gas ₹600 = ₹5,855</p>
                <p className="text-amber-400">8. Calculate Unit Cost: ₹31.14 / pkt (Margin 37.7%)</p>
                <p>9. Record Stock Ledger Vouchers</p>
                <p>10. Trigger Reorder Alert for Cartons</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Live PostgreSQL Pool</span>
                <Link
                  to="/production/run"
                  className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1"
                >
                  <span>View Production Execution</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-primary-500 to-amber-300 flex items-center justify-center text-white font-bold text-lg">
              🥨
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">Sri Murukku Foods</div>
              <div className="text-xs text-slate-500">
                Plot 14, Food Tech Park, Thuvakudi, Tiruchirappalli, Tamil Nadu - 620015
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 text-center md:text-right">
            <div>GSTIN: <span className="font-mono font-semibold text-slate-700">33ABCDE1234F1Z5</span> | Phone: +91 94431 82026</div>
            <div className="mt-1">NIT Tiruchirappalli Winter Internship 2026 Implementation</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
