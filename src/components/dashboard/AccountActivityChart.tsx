import React, { useState } from 'react';
import { formatCurrency } from '../../lib/formatters';
import { BarChart3, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface MonthlyData {
  month: string;
  inflow: number;
  outflow: number;
  repayment: number;
}

const MONTHLY_STATS: MonthlyData[] = [
  { month: 'May', inflow: 7400, outflow: 4200, repayment: 506 },
  { month: 'Jun', inflow: 7800, outflow: 4600, repayment: 506 },
  { month: 'Jul', inflow: 7400, outflow: 3900, repayment: 506 },
  { month: 'Aug', inflow: 11900, outflow: 5200, repayment: 0 }, // Advance disbursed in August!
  { month: 'Sep', inflow: 7400, outflow: 4100, repayment: 760 },
  { month: 'Oct', inflow: 7400, outflow: 4400, repayment: 760 },
];

export const AccountActivityChart: React.FC = () => {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(5); // October default
  const activeMonth = MONTHLY_STATS[selectedMonthIndex];

  // SVG Chart Dimensions
  const maxVal = 13000;
  const chartHeight = 160;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Account Cashflow & Advances Servicing
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare monthly inflows, operational spending, and advance deductions.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Total Inflow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-400 dark:bg-slate-600"></span>
            <span className="text-slate-600 dark:text-slate-400">Outflows</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Advance Repayment</span>
          </div>
        </div>
      </div>

      {/* SVG Multi-Bar Visualization */}
      <div className="relative pt-6 pb-2">
        <div className="h-44 flex items-end justify-between gap-2 sm:gap-6 border-b border-slate-200 dark:border-slate-800 px-2">
          {MONTHLY_STATS.map((d, idx) => {
            const isSelected = selectedMonthIndex === idx;
            const inflowH = (d.inflow / maxVal) * chartHeight;
            const outflowH = (d.outflow / maxVal) * chartHeight;
            const repayH = (d.repayment / maxVal) * chartHeight;

            return (
              <div
                key={d.month}
                onClick={() => setSelectedMonthIndex(idx)}
                className={`flex-1 flex flex-col items-center cursor-pointer transition-all group ${
                  isSelected ? 'scale-105' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <div className="flex items-end gap-1 sm:gap-1.5 h-40">
                  {/* Inflow bar */}
                  <div
                    style={{ height: `${inflowH}px` }}
                    className={`w-3 sm:w-4 rounded-t-sm transition-all ${
                      isSelected
                        ? 'bg-emerald-500 shadow-md shadow-emerald-500/30'
                        : 'bg-emerald-400/80 dark:bg-emerald-600/80 group-hover:bg-emerald-500'
                    }`}
                  ></div>

                  {/* Outflow bar */}
                  <div
                    style={{ height: `${outflowH}px` }}
                    className={`w-3 sm:w-4 rounded-t-sm transition-all ${
                      isSelected
                        ? 'bg-slate-400 dark:bg-slate-500'
                        : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-400'
                    }`}
                  ></div>

                  {/* Repayment bar */}
                  <div
                    style={{ height: `${Math.max(4, repayH)}px` }}
                    className={`w-3 sm:w-4 rounded-t-sm transition-all ${
                      isSelected
                        ? 'bg-brand-500 shadow-md shadow-brand-500/30'
                        : 'bg-brand-400/80 dark:bg-brand-600/80 group-hover:bg-brand-500'
                    }`}
                  ></div>
                </div>

                {/* Month label */}
                <span
                  className={`mt-2 text-xs font-semibold ${
                    isSelected
                      ? 'text-brand-600 dark:text-brand-400 underline decoration-2 underline-offset-4'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {d.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Month Interactive Details Bar */}
      <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Selected: {activeMonth.month} 2026 Breakdown
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 mr-1.5 font-sans">Inflows:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(activeMonth.inflow)}
            </span>
          </div>

          <div>
            <span className="text-slate-500 dark:text-slate-400 mr-1.5 font-sans">Outflows:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {formatCurrency(activeMonth.outflow)}
            </span>
          </div>

          <div>
            <span className="text-slate-500 dark:text-slate-400 mr-1.5 font-sans">Advance Serviced:</span>
            <span className="font-bold text-brand-600 dark:text-brand-400">
              {activeMonth.repayment > 0 ? formatCurrency(activeMonth.repayment) : '$0.00'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 dark:text-slate-400 mr-1.5 font-sans">Net Cash Surplus:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(activeMonth.inflow - activeMonth.outflow - activeMonth.repayment)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
