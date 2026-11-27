import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Layout } from './Layout';

export const RoleGuard = ({ allowedRoles, children }) => {
  const { currentUser } = useERP();
  const userRole = (currentUser?.id || 'admin').toLowerCase();

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <Layout
        title="Access Restricted"
        description="Role-Based Access Control (RBAC)"
      >
        <div className="max-w-lg mx-auto mt-12 p-8 bg-white dark:bg-surface-dark rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-lg text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Permission Denied
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Your active role (<strong>{currentUser?.label || userRole}</strong>) does not have authority to access this module.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Per the Order-to-Audit specification, each role sees only the workflows it needs.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Dashboard</span>
          </Link>
        </div>
      </Layout>
    );
  }

  return children;
};

export default RoleGuard;
