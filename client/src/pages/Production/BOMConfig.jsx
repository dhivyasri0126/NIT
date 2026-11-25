import React, { useState } from 'react';
import { Layers, Plus, Save, Edit3, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Layout } from '../../components/common/Layout';

export const BOMConfig = () => {
  const { bom, setBom } = useERP();
  const [ingredients, setIngredients] = useState(bom.ingredients);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleQtyChange = (idx, val) => {
    setIngredients(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], plannedQty: Number(val) || 0 };
      return next;
    });
  };

  const handleSave = () => {
    setBom(prev => ({ ...prev, ingredients }));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const totalRawCost = ingredients.reduce((sum, it) => sum + (it.plannedQty * it.rate), 0);
  const totalStandardCost = totalRawCost + bom.standardOverheads.labour + bom.standardOverheads.gasAndPower;
  const standardCostPerPkt = (totalStandardCost / bom.batchSize).toFixed(2);

  return (
    <Layout
      breadcrumbs={['Production Management', 'Bill of Materials (BOM)']}
      title="Standard Bill of Materials (BOM)"
      subtitle="Recipe formula, standard input ratios, and overhead allocations per batch of 200 packets"
      actions={
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save BOM Formula</span>
        </button>
      }
    >
      <div className="space-y-6">
        {savedMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Standard BOM configurations updated successfully!</span>
          </div>
        )}

        <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">
                BOM-001
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {bom.productName} Standard Recipe
              </h2>
              <p className="text-xs text-slate-400">
                Standard Batch Size: <strong className="text-slate-700 dark:text-slate-300">200 packets</strong> (200g net weight per pouch)
              </p>
            </div>

            <div className="p-3 bg-primary-50 dark:bg-primary-950/40 rounded-2xl border border-primary-100 dark:border-primary-900/40 text-right text-xs">
              <div className="text-slate-500 font-medium">Standard Cost / Pkt</div>
              <div className="text-xl font-black text-primary-600 dark:text-primary-400">
                ₹{standardCostPerPkt}
              </div>
            </div>
          </div>

          {/* Ingredients Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Ingredient / Material</th>
                  <th className="pb-3 text-right">Standard Batch Qty</th>
                  <th className="pb-3 text-right">Unit Standard Rate</th>
                  <th className="pb-3 text-right">Per Packet Ratio</th>
                  <th className="pb-3 text-right pr-2">Calculated Cost (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {ingredients.map((item, idx) => {
                  const cost = item.plannedQty * item.rate;
                  const perPktRatio = (item.plannedQty / bom.batchSize).toFixed(4);

                  return (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 pl-2 font-bold text-slate-800 dark:text-slate-200">
                        {item.name}
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <input
                            type="number"
                            step="0.1"
                            value={item.plannedQty}
                            onChange={(e) => handleQtyChange(idx, e.target.value)}
                            className="w-20 px-2 py-1 text-right font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                          />
                          <span className="text-slate-400 w-8 text-left">{item.unit}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-right text-slate-500">
                        ₹{item.rate.toFixed(2)} / {item.unit}
                      </td>
                      <td className="py-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                        {perPktRatio} {item.unit}
                      </td>
                      <td className="py-3.5 text-right pr-2 font-bold text-slate-900 dark:text-white">
                        ₹{cost.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Standard Overheads Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Allocated Labour Cost</span>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                ₹{bom.standardOverheads.labour.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-400">(Frying, sorting, packing crew)</span>
            </div>

            <div>
              <span className="text-slate-500 font-medium">Power & LPG Gas Cost</span>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                ₹{bom.standardOverheads.gasAndPower.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-400">(Deep frying burner fuels)</span>
            </div>

            <div>
              <span className="text-slate-500 font-medium">Total Standard Batch Cost</span>
              <div className="text-base font-bold text-primary-600 dark:text-primary-400 mt-0.5">
                ₹{totalStandardCost.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-400">(Standard MRP ₹50.00 / pkt)</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
