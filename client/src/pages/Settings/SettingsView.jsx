import React, { useState } from 'react';
import {
  Settings,
  Building,
  Globe,
  Wifi,
  History,
  Shield,
  Save,
  CheckCircle2,
  Moon,
  Sun
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Layout } from '../../components/common/Layout';

export const SettingsView = () => {
  const { company, setCompany, isOffline, setIsOffline, offlineQueue, syncOfflineQueue } = useERP();
  const { language, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const [formCompany, setFormCompany] = useState(company);
  const [saved, setSaved] = useState(false);

  const handleSaveCompany = (e) => {
    e.preventDefault();
    setCompany(formCompany);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const activityLogs = [
    { time: 'Today 10:30 AM', user: 'M. Selvam (Supervisor)', action: 'Batch PR-001 finalized with 188 good pkts output.' },
    { time: 'Today 09:45 AM', user: 'Dhivyasri M (Admin)', action: 'Generated GST Invoice INV-0015 for Retailer A (₹7,875.00).' },
    { time: 'Today 09:15 AM', user: 'K. Raman (Salesman)', action: 'Booked sales order SO-0025 for 150 pkts Murukku.' },
    { time: 'Today 08:30 AM', user: 'M. Selvam (Supervisor)', action: 'Issued 40kg Rice Flour & 10.5L Oil for production.' },
    { time: 'Today 08:00 AM', user: 'Admin', action: 'Inward PO-001: 60kg Rice Flour from ABC Traders received.' },
  ];

  return (
    <Layout
      breadcrumbs={['Settings', 'Configuration']}
      title="System Settings & Audit Trail"
      subtitle="Configure enterprise parameters, statutory tax identifiers, and view tamper-proof activity logs"
    >
      <div className="space-y-6">
        {saved && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Company details updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Profile Card */}
          <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-primary-500" />
              <span>Company & GST Legal Entity</span>
            </h3>

            <form onSubmit={handleSaveCompany} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Company Trade Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  value={formCompany.name}
                  onChange={(e) => setFormCompany({ ...formCompany, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Registered Address</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  value={formCompany.address}
                  onChange={(e) => setFormCompany({ ...formCompany, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">GSTIN</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                    value={formCompany.gstin}
                    onChange={(e) => setFormCompany({ ...formCompany, gstin: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">State & Code</label>
                  <input
                    type="text"
                    readOnly
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500"
                    value="Tamil Nadu (33)"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* Localization & Preferences */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary-500" />
                <span>Localization & Appearance</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">System Language</div>
                    <div className="text-slate-400 text-[11px]">English and Tamil (தமிழ்) toggle</div>
                  </div>
                  <button
                    onClick={toggleLanguage}
                    className="px-3 py-1.5 rounded-xl bg-primary-500 text-white font-bold"
                  >
                    {language === 'en' ? 'English (EN)' : 'தமிழ் (TA)'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Theme Mode</div>
                    <div className="text-slate-400 text-[11px]">Enterprise light theme or dark theme</div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold flex items-center gap-1.5"
                  >
                    {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                    <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Offline Order Sync Status</div>
                    <div className="text-slate-400 text-[11px]">{offlineQueue.length} orders pending sync</div>
                  </div>
                  <button
                    onClick={() => setIsOffline(prev => !prev)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                      isOffline ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {isOffline ? 'Simulating Offline' : 'Online'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Activity & Audit Trail */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-primary-500" />
            <span>Audited User Activity Trail (Immutable Log)</span>
          </h3>

          <div className="space-y-2.5">
            {activityLogs.map((log, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{log.user}: </span>
                  <span className="text-slate-600 dark:text-slate-400">{log.action}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};
