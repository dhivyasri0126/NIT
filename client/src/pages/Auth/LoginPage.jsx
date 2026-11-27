import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Smartphone,
  Factory,
  Receipt,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { authService } from '../../services/authService';
import { INITIAL_ROLES } from '../../data/benchmarkData';

const DEMO_USERS = [
  {
    roleId: 'admin',
    name: 'Dhivyasri M',
    role: 'Admin / Manager',
    email: 'dhivyasri@srimurukku.com',
    icon: ShieldCheck,
    color: 'from-purple-500 to-indigo-600',
  },
  {
    roleId: 'salesman',
    name: 'K. Ramanathan',
    role: 'Salesman (Field)',
    email: 'raman@srimurukku.com',
    icon: Smartphone,
    color: 'from-amber-500 to-orange-600',
  },
  {
    roleId: 'supervisor',
    name: 'M. Selvam',
    role: 'Production Supervisor',
    email: 'selvam@srimurukku.com',
    icon: Factory,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    roleId: 'auditor',
    name: 'V. Jayanthi CA',
    role: 'Accountant / Auditor',
    email: 'audit@srimurukku.com',
    icon: Receipt,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    roleId: 'owner',
    name: 'S. Murugan',
    role: 'Business Owner',
    email: 'murugan@srimurukku.com',
    icon: TrendingUp,
    color: 'from-rose-500 to-pink-600',
  },
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { switchRole } = useERP();

  const [email, setEmail] = useState('dhivyasri@srimurukku.com');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');

  // Check URL param ?role=salesman
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      const found = DEMO_USERS.find(u => u.roleId === roleParam);
      if (found) {
        setEmail(found.email);
        setPassword('Password@123');
      }
    }
  }, [searchParams]);

  // Quick check backend health
  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'healthy') setBackendStatus('connected');
        else setBackendStatus('error');
      })
      .catch(() => setBackendStatus('offline'));
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Attempt backend JWT login
      const response = await authService.login(email, password);

      if (response && response.data?.token) {
        localStorage.setItem('sri_murukku_token', response.data.token);
        localStorage.setItem('sri_murukku_user', JSON.stringify(response.data.user));

        // Find matching role
        const userRoles = response.data.user.roles || [];
        const roleName = userRoles[0] ? userRoles[0].toLowerCase() : 'admin';
        switchRole(roleName);

        if (roleName === 'salesman') {
          navigate('/sales/mobile-order');
        } else {
          navigate('/dashboard');
        }
      } else {
        // Fallback demo login
        handleDemoFallback();
      }
    } catch (err) {
      console.warn('Backend login notice, falling back to local session if offline:', err);
      // In development or if backend is offline, permit standard benchmark login
      const demoUser = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (demoUser && password === 'Password@123') {
        switchRole(demoUser.roleId);
        navigate('/dashboard');
      } else {
        setError(err.message || 'Invalid credentials. Password is Password@123');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (user) => {
    setEmail(user.email);
    setPassword('Password@123');
    setError('');

    // Optional instant login trigger
    switchRole(user.roleId);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Brand Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-primary-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-black text-2xl group-hover:scale-105 transition-transform">
            🥨
          </div>
          <div className="text-left">
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
              Sri Murukku Foods
            </h1>
            <p className="text-xs text-primary-600 font-semibold">
              ERP Portal & Audit System
            </p>
          </div>
        </Link>
        <h2 className="mt-6 text-2xl font-extrabold text-slate-900">
          Sign In to Your Workspace
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          NIT Tiruchirappalli Winter Internship 2026 Problem Statement
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 sm:px-10">
          {/* Backend Status Indicator */}
          <div className="mb-6 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">PostgreSQL Backend:</span>
            <div className="flex items-center gap-1.5 font-semibold">
              {backendStatus === 'connected' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-emerald-700">Online (Port 5000 / Neon DB)</span>
                </>
              ) : backendStatus === 'checking' ? (
                <>
                  <RefreshCw className="w-3 h-3 text-slate-400 animate-spin" />
                  <span className="text-slate-500">Connecting...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-amber-700">Local Cache Mode Ready</span>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@srimurukku.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span>Remember this terminal</span>
              </label>
              <span className="text-slate-400">Default: Password@123</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to ERP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Sign-In Selector */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1-Click Quick Demo Sign-In
              </span>
              <span className="text-[10px] text-primary-600 font-semibold bg-primary-50 px-2 py-0.5 rounded-full">
                5 Benchmark Users
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_USERS.map((user) => {
                const Icon = user.icon;
                const isSelected = email.toLowerCase() === user.email.toLowerCase();
                return (
                  <button
                    key={user.roleId}
                    type="button"
                    onClick={() => handleQuickSelect(user)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50/50 shadow-sm ring-1 ring-primary-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${user.color} flex items-center justify-center text-white flex-shrink-0 shadow-xs`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {user.role}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/dashboard"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Skip login and enter Dashboard as Guest →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
