import React from 'react';
import { useERP } from '../../context/ERPContext';
import { Layout } from '../../components/common/Layout';
import { AdminDashboard } from './AdminDashboard';
import { SalesmanDashboard } from './SalesmanDashboard';
import { SupervisorDashboard } from './SupervisorDashboard';
import { AuditorDashboard } from './AuditorDashboard';
import { OwnerDashboard } from './OwnerDashboard';

export const DashboardRouter = () => {
  const { currentUser, switchRole } = useERP();

  const renderDashboard = () => {
    switch (currentUser.id) {
      case 'salesman':
        return <SalesmanDashboard />;
      case 'supervisor':
        return <SupervisorDashboard />;
      case 'auditor':
        return <AuditorDashboard />;
      case 'owner':
        return <OwnerDashboard />;
      case 'admin':
      default:
        return <AdminDashboard />;
    }
  };

  const roles = [
    { id: 'admin', label: 'Admin / Manager' },
    { id: 'salesman', label: 'Salesman (Field)' },
    { id: 'supervisor', label: 'Supervisor' },
    { id: 'auditor', label: 'Auditor' },
    { id: 'owner', label: 'Owner / MD' },
  ];

  const roleSwitcherAction = (
    <div className="flex items-center gap-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 p-1 rounded-2xl shadow-xs overflow-x-auto">
      {roles.map(r => (
        <button
          key={r.id}
          onClick={() => switchRole(r.id)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            currentUser.id === r.id
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );

  return (
    <Layout
      breadcrumbs={['Dashboard', currentUser.badge]}
      title={`${currentUser.badge} Overview`}
      subtitle={`Order-to-Audit Management System for Sri Murukku Foods`}
      actions={roleSwitcherAction}
    >
      {renderDashboard()}
    </Layout>
  );
};
