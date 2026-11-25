import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, CheckCircle2, AlertTriangle, ArrowRight, ShoppingCart } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Layout } from '../../components/common/Layout';

export const ProductionPlan = () => {
  const { materials, bom } = useERP();
  const navigate = useNavigate();

  const [targetPackets, setTargetPackets] = useState(200);

  // BOM ratios per packet
  const flourPerPkt = 40.0 / 200; // 0.20 kg
  const oilPerPkt = 10.0 / 200; // 0.05 L
  const spicePerPkt = 1.2 / 200; // 0.006 kg
  const pouchPerPkt = 200 / 200; // 1 pc
  const cartonPerPkt = 10 / 200; // 0.05 carton

  const requirements = [
    {
      name: 'Rice Flour',
      unit: 'kg',
      required: Number((targetPackets * flourPerPkt).toFixed(1)),
      currentStock: materials.find(m => m.name === 'Rice Flour')?.closingStock || 120,
    },
    {
      name: 'Cooking Oil',
      unit: 'L',
      required: Number((targetPackets * oilPerPkt).toFixed(1)),
      currentStock: materials.find(m => m.name === 'Cooking Oil')?.closingStock || 19.5,
    },
    {
      name: 'Spice Mix',
      unit: 'kg',
      required: Number((targetPackets * spicePerPkt).toFixed(2)),
      currentStock: materials.find(m => m.name === 'Spice Mix')?.closingStock || 3.8,
    },
    {
      name: 'Pouches (200 g)',
      unit: 'pcs',
      required: Math.ceil(targetPackets * pouchPerPkt),
      currentStock: materials.find(m => m.name.includes('Pouches'))?.closingStock || 306,
    },
    {
      name: 'Cartons (20-pack)',
      unit: 'pcs',
      required: Math.ceil(targetPackets * cartonPerPkt),
      currentStock: materials.find(m => m.name.includes('Cartons'))?.closingStock || 21,
    },
  ];

  return (
    <Layout
      breadcrumbs={['Production Management', 'Production Plan']}
      title="Production Planning & MRP Assistant"
      subtitle="Material Requirements Planning (MRP) simulation for target production batches"
    >
      <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Target Murukku (200 g) Production Quantity
            </h3>
            <p className="text-xs text-slate-400">
              Enter desired packet output to calculate bill of material requirements
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              step="50"
              min="50"
              className="w-32 px-3 py-2 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 font-bold text-base text-primary-600 dark:text-primary-400 text-center"
              value={targetPackets}
              onChange={(e) => setTargetPackets(Number(e.target.value) || 0)}
            />
            <span className="text-xs font-semibold text-slate-500">Packets</span>
          </div>
        </div>

        {/* Requirements Simulation Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Ingredient / Material</th>
                <th className="pb-3 text-right">Required Quantity</th>
                <th className="pb-3 text-right">Current Closing Stock</th>
                <th className="pb-3 text-right">Net Available / Shortfall</th>
                <th className="pb-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {requirements.map((item, idx) => {
                const diff = item.currentStock - item.required;
                const isShort = diff < 0;

                return (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 pl-2 font-bold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </td>
                    <td className="py-3.5 text-right font-bold text-slate-900 dark:text-white">
                      {item.required} {item.unit}
                    </td>
                    <td className="py-3.5 text-right text-slate-600 dark:text-slate-400">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className={`py-3.5 text-right font-bold ${isShort ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isShort ? `Short by ${Math.abs(diff).toFixed(1)} ${item.unit}` : `+${diff.toFixed(1)} ${item.unit} surplus`}
                    </td>
                    <td className="py-3.5 text-center">
                      {isShort ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          Purchase Required
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          Adequate Stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};
