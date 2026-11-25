import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory, Calendar, User, Eye, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Layout } from '../../components/common/Layout';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ProductionHistory = () => {
  const { productionRuns } = useERP();
  const navigate = useNavigate();

  return (
    <Layout
      breadcrumbs={['Production Management', 'Production History']}
      title="Production Batch History & Quality Log"
      subtitle="Complete chronological audit trail of all finished food production runs"
    >
      <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Batch Run ID</th>
                <th className="pb-3">Product</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Planned (pkts)</th>
                <th className="pb-3 text-right">Actual Good (pkts)</th>
                <th className="pb-3 text-right">Yield Variance</th>
                <th className="pb-3 text-right">Pouch Wastage</th>
                <th className="pb-3">Supervisor</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {productionRuns.map(run => (
                <tr key={run.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 pl-2 font-bold text-primary-600 dark:text-primary-400">
                    {run.id} ({run.batchNo})
                  </td>
                  <td className="py-3.5 font-semibold text-slate-800 dark:text-slate-100">
                    {run.productName}
                  </td>
                  <td className="py-3.5 text-slate-500">{run.date}</td>
                  <td className="py-3.5 text-right font-medium text-slate-600 dark:text-slate-400">
                    {run.expectedOutput}
                  </td>
                  <td className="py-3.5 text-right font-bold text-slate-900 dark:text-white">
                    {run.actualOutput}
                  </td>
                  <td className="py-3.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                      {run.yieldVariancePercent}%
                    </span>
                  </td>
                  <td className="py-3.5 text-right text-amber-600 font-semibold">
                    {run.damagedPouches} pkts
                  </td>
                  <td className="py-3.5 text-slate-600 dark:text-slate-300">{run.supervisor}</td>
                  <td className="py-3.5 text-right pr-2">
                    <button
                      onClick={() => navigate('/production/run')}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};
