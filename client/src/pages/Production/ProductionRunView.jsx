import React, { useState } from 'react';
import {
  Factory,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Boxes,
  Plus,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
  DollarSign
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Layout } from '../../components/common/Layout';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ProductionRunView = () => {
  const { productionRuns, createProductionRun, products, materials, bom } = useERP();
  const [activeTab, setActiveTab] = useState('consumption');
  const [showNewRunModal, setShowNewRunModal] = useState(false);

  // Form state for new production run
  const [batchNo, setBatchNo] = useState('BATCH-002');
  const [actualGood, setActualGood] = useState(195);
  const [damagedPouches, setDamagedPouches] = useState(3);
  const [oilConsumed, setOilConsumed] = useState(10.2);

  const currentRun = productionRuns[0]; // PR-001 benchmark

  const handleCreateRun = (e) => {
    e.preventDefault();
    const planned = 200;
    const yieldVar = (((actualGood - planned) / planned) * 100).toFixed(1);
    const oilDiff = (oilConsumed - 10.0).toFixed(1);
    const oilVar = (((oilConsumed - 10.0) / 10.0) * 100).toFixed(1);

    createProductionRun({
      productId: 'PROD-001',
      productName: 'Murukku (200 g)',
      batchNo,
      expectedOutput: 200,
      actualOutput: Number(actualGood),
      damagedPouches: Number(damagedPouches),
      wastageGrams: 600,
      cartonsUsed: Math.ceil(actualGood / 20),
      yieldVariancePercent: Number(yieldVar),
      materialsConsumed: [
        { materialId: 'MAT-001', name: 'Rice Flour', plannedQty: 40.0, actualQty: 40.0, unit: 'kg', difference: 0.0, variancePercent: 0.0, cost: 1725.00 },
        { materialId: 'MAT-002', name: 'Cooking Oil', plannedQty: 10.0, actualQty: Number(oilConsumed), unit: 'L', difference: Number(oilDiff), variancePercent: Number(oilVar), cost: 1428.00 },
        { materialId: 'MAT-003', name: 'Spice Mix', plannedQty: 1.2, actualQty: 1.2, unit: 'kg', difference: 0.0, variancePercent: 0.0, cost: 240.00 },
        { materialId: 'MAT-004', name: 'Pouches (200 g)', plannedQty: 200, actualQty: Number(actualGood) + Number(damagedPouches), unit: 'pcs', difference: -(200 - (Number(actualGood) + Number(damagedPouches))), variancePercent: -2.0, cost: 495.00 },
        { materialId: 'MAT-005', name: 'Cartons (20-pack)', plannedQty: 10, actualQty: Math.ceil(actualGood / 20), unit: 'pcs', difference: 0, variancePercent: 0.0, cost: 150.00 },
      ],
      costing: {
        flourCost: 1725.00,
        oilCost: 1428.00,
        spiceCost: 240.00,
        pouchCost: 495.00,
        cartonCost: 150.00,
        labourCost: 1200.00,
        powerGasCost: 600.00,
        totalManufacturingCost: 5838.00,
        costPerPacket: 29.93,
        sellingPrice: 50.00,
        profitPerPacket: 20.07,
        profitMarginPercent: 40.1,
      },
      notes: 'Second run with corrected frying temperature.',
    });

    setShowNewRunModal(false);
  };

  return (
    <Layout
      breadcrumbs={['Production Management', 'Production Run', currentRun.id]}
      title={`Production Run – ${currentRun.id}`}
      subtitle={`Batch processing & planned-versus-actual consumption monitoring for ${currentRun.productName}`}
      actions={
        <button
          onClick={() => setShowNewRunModal(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Production Run</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Meta Header Card */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Batch No: <strong className="text-slate-700 dark:text-slate-300 font-mono">{currentRun.batchNo}</strong></span>
              <span>•</span>
              <span>Date: <strong className="text-slate-700 dark:text-slate-300">{currentRun.date}</strong></span>
              <span>•</span>
              <span>Expected Output: <strong className="text-slate-700 dark:text-slate-300">{currentRun.expectedOutput} packets</strong></span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {currentRun.productName}
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Supervisor: {currentRun.supervisor} | Standard 200 Packet Batch Recipe
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-right">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Actual Good Output</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {currentRun.actualOutput} <span className="text-xs font-normal">pkts</span>
              </div>
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-2xl text-right">
              <div className="text-[10px] uppercase font-semibold text-rose-500">Yield Variance</div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {currentRun.yieldVariancePercent}%
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl text-right">
              <div className="text-[10px] uppercase font-semibold text-amber-500">Pouch Wastage</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {currentRun.damagedPouches} <span className="text-xs font-normal">pkts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Buttons: Material Consumption | Costing | Remarks */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: 'consumption', label: 'Material Consumption (Planned vs Actual)' },
            { id: 'costing', label: 'Batch Costing & Economics' },
            { id: 'remarks', label: 'Supervisor Remarks & Notes' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-white dark:bg-surface-dark text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1. Material Consumption Planned vs Actual Table */}
        {activeTab === 'consumption' && (
          <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Planned vs Actual Material Consumption
                </h3>
                <p className="text-xs text-slate-400">
                  Critical audit table: Automatically highlights any ingredient variance exceeding ±3.0%
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>&gt; 3% Variance Highlighted</span>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Material</th>
                    <th className="pb-3 text-right">Planned Qty</th>
                    <th className="pb-3 text-right">Actual Qty</th>
                    <th className="pb-3 text-right">Difference</th>
                    <th className="pb-3 text-right">Variance %</th>
                    <th className="pb-3 text-center">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {currentRun.materialsConsumed.map((item, idx) => {
                    const isAlert = Math.abs(item.variancePercent) > 3.0;

                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isAlert
                            ? 'bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <td className="py-3.5 pl-2 font-bold flex items-center gap-2">
                          {isAlert && <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse flex-shrink-0" />}
                          <span>{item.name}</span>
                        </td>
                        <td className="py-3.5 text-right font-semibold">
                          {item.plannedQty} {item.unit}
                        </td>
                        <td className="py-3.5 text-right font-bold text-slate-900 dark:text-white">
                          {item.actualQty} {item.unit}
                        </td>
                        <td className={`py-3.5 text-right font-bold ${item.difference > 0 ? 'text-rose-600' : item.difference < 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                          {item.difference > 0 ? `+${item.difference}` : item.difference} {item.unit}
                        </td>
                        <td className="py-3.5 text-right">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                              isAlert
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}
                          >
                            {item.variancePercent > 0 ? `+${item.variancePercent}%` : `${item.variancePercent}%`}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          {isAlert ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                              Variance Exceeded
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                              Within Normal Spec
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Analysis Note */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-100">Audit Finding:</div>
              <p>• Cooking Oil consumption was 10.5 L against 10.0 L planned, exceeding the 3% variance threshold with +5.0%.</p>
              <p>• Good packets output was 188 against 200 expected (-6.0% yield variance) due to dough consistency and 6 damaged pouches during heat sealing.</p>
            </div>
          </div>
        )}

        {/* 2. Batch Costing Tab */}
        {activeTab === 'costing' && (
          <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Cost Component Breakdown (Batch PR-001)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex justify-between py-2">
                  <span>Rice Flour (40 kg × ₹43.125):</span>
                  <span className="font-bold">₹1,725.00</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Cooking Oil (10.5 L × ₹140):</span>
                  <span className="font-bold">₹1,470.00</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Spice Mix (1.2 kg × ₹200):</span>
                  <span className="font-bold">₹240.00</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Pouches (194 pcs × ₹2.50):</span>
                  <span className="font-bold">₹485.00</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Cartons (9 pcs × ₹15):</span>
                  <span className="font-bold">₹135.00</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Direct Labour:</span>
                  <span className="font-bold">₹1,200.00</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Gas & Power Overheads:</span>
                  <span className="font-bold">₹600.00</span>
                </div>
                <div className="flex justify-between py-3 text-sm font-bold text-primary-600 dark:text-primary-400">
                  <span>Total Manufacturing Cost:</span>
                  <span>₹5,855.00</span>
                </div>
              </div>

              {/* Unit Economics Cards */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200/60 dark:border-primary-900/40 text-xs">
                  <div className="text-slate-500 font-semibold">Cost Per Good Packet Produced</div>
                  <div className="text-3xl font-black text-primary-700 dark:text-primary-300 mt-1">
                    ₹31.14
                  </div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    Calculated as: ₹5,855.00 / 188 good packets
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <div className="text-slate-400">Selling Price</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">₹50.00</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40">
                    <div className="text-emerald-600 font-semibold">Profit / Packet</div>
                    <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-1">₹18.86</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Remarks Tab */}
        {activeTab === 'remarks' && (
          <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-3 text-xs">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Supervisor Notes & Machine Calibration
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {currentRun.notes}
            </p>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-amber-800 dark:text-amber-300">
              Action Plan: Thermostat recalibration scheduled before BATCH-002 to maintain standard 10.0 L oil consumption.
            </div>
          </div>
        )}
      </div>

      {/* Modal for New Production Run */}
      {showNewRunModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateRun} className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Create New Production Run
            </h3>
            <p className="text-xs text-slate-400">
              Record actual output and ingredients consumed for Murukku (200 g)
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Batch Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Target Output (pkts)</label>
                <input
                  type="number"
                  readOnly
                  value="200"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Actual Good Output *</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                  value={actualGood}
                  onChange={(e) => setActualGood(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Damaged Pouches</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-rose-500"
                  value={damagedPouches}
                  onChange={(e) => setDamagedPouches(e.target.value)}
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Cooking Oil Consumed (L) *</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                  value={oilConsumed}
                  onChange={(e) => setOilConsumed(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewRunModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold"
              >
                Save Production Run
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};
