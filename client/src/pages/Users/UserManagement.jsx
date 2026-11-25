import React from 'react';
import { Users, Shield, Check, X, UserCheck, Key } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Layout } from '../../components/common/Layout';
import { INITIAL_ROLES } from '../../data/benchmarkData';

export const UserManagement = () => {
  const { currentUser, switchRole } = useERP();

  const permissions = [
    { name: 'Create & Capture Orders', admin: true, salesman: true, supervisor: false, auditor: false, owner: true },
    { name: 'Approve / Reject Orders', admin: true, salesman: false, supervisor: false, auditor: false, owner: true },
    { name: 'Create Production Batches', admin: true, salesman: false, supervisor: true, auditor: false, owner: true },
    { name: 'Modify Recipe / BOM Ratios', admin: true, salesman: false, supervisor: true, auditor: false, owner: true },
    { name: 'Generate Statutory GST Invoices', admin: true, salesman: false, supervisor: false, auditor: true, owner: true },
    { name: 'Record Purchases & Raw Materials', admin: true, salesman: false, supervisor: true, auditor: true, owner: true },
    { name: 'Record Payment Receipts', admin: true, salesman: true, supervisor: false, auditor: true, owner: true },
    { name: 'View Profit Margins & Unit Costs', admin: true, salesman: false, supervisor: false, auditor: true, owner: true },
  ];

  return (
    <Layout
      breadcrumbs={['User Management', 'Roles & RBAC']}
      title="User Roles & Access Control (RBAC)"
      subtitle="Role-based permissions matrix for production, sales, finance, and shop floor security"
    >
      <div className="space-y-6">
        {/* User Accounts List */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            System Authorized Personnel
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {INITIAL_ROLES.map(role => {
              const isCurrent = currentUser.id === role.id;
              return (
                <div
                  key={role.id}
                  className={`p-4 rounded-2xl border text-xs transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-primary-50/50 dark:bg-primary-950/40 border-primary-500 shadow-md ring-2 ring-primary-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        {role.name.charAt(0)}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-500 text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{role.name}</div>
                    <div className="text-[11px] text-primary-600 dark:text-primary-400 font-semibold mt-0.5">{role.label}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{role.email}</div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                    <button
                      onClick={() => switchRole(role.id)}
                      className={`w-full py-1.5 rounded-xl font-semibold transition-all ${
                        isCurrent
                          ? 'bg-primary-600 text-white'
                          : 'bg-white dark:bg-surface-dark hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isCurrent ? 'Current Session' : 'Switch to this Role'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Permissions Matrix Table */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Role-Based Access Control (RBAC) Matrix
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="pb-3 pl-2">System Capability / Module</th>
                  <th className="pb-3 text-center">Admin</th>
                  <th className="pb-3 text-center">Salesman</th>
                  <th className="pb-3 text-center">Supervisor</th>
                  <th className="pb-3 text-center">Auditor</th>
                  <th className="pb-3 text-center pr-2">Owner (MD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {permissions.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 pl-2 font-semibold text-slate-800 dark:text-slate-200">{p.name}</td>
                    <td className="py-3 text-center">{p.admin ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                    <td className="py-3 text-center">{p.salesman ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                    <td className="py-3 text-center">{p.supervisor ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                    <td className="py-3 text-center">{p.auditor ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                    <td className="py-3 text-center pr-2">{p.owner ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};
