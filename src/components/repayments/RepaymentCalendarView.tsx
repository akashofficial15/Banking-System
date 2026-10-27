import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { Calendar, ChevronLeft, ChevronRight, Clock, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

export const RepaymentCalendarView: React.FC = () => {
  const { advances, setSelectedAdvanceId, setActiveTab } = useBank();

  // Calendar for October & November 2026
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed, 9 = October
  const [currentYear, setCurrentYear] = useState<number>(2026);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Gather all scheduled installments across all active advances
  const allEvents = advances.flatMap((adv) =>
    adv.repaymentSchedule.map((inst) => ({
      advanceId: adv.id,
      applicationNo: adv.applicationNo,
      purpose: adv.purpose,
      installmentNo: inst.installmentNo,
      totalDue: inst.totalDue,
      dueDate: new Date(inst.dueDate),
      status: inst.status,
    }))
  );

  // Generate days in month
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Monthly Repayment Calendar
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize deduction dates, payroll lien sync, and payment deadlines.
          </p>
        </div>

        {/* Month selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold font-mono px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-center text-xs font-semibold text-slate-500 py-2.5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {blankDays.map((_, i) => (
            <div key={`blank-${i}`} className="min-h-24 bg-slate-50/40 dark:bg-slate-950/20 p-2"></div>
          ))}

          {daysArray.map((day) => {
            // Find events for this day
            const dayEvents = allEvents.filter(
              (e) =>
                e.dueDate.getDate() === day &&
                e.dueDate.getMonth() === currentMonth &&
                e.dueDate.getFullYear() === currentYear
            );

            const isToday = day === 25 && currentMonth === 9 && currentYear === 2026;

            return (
              <div
                key={day}
                className={`min-h-24 p-2 transition-all ${
                  isToday
                    ? 'bg-brand-50/30 dark:bg-brand-950/20 ring-1 ring-inset ring-brand-500/50'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50/60 dark:hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`font-mono text-xs font-semibold ${
                      isToday
                        ? 'w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {day}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-bold uppercase text-brand-600 dark:text-brand-400">
                      Today
                    </span>
                  )}
                </div>

                {/* Event Pills */}
                <div className="space-y-1">
                  {dayEvents.map((evt, idx) => {
                    const isPaid = evt.status === 'PAID';
                    const isDue = evt.status === 'DUE' || evt.status === 'UPCOMING';

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedAdvanceId(evt.advanceId);
                          setActiveTab('tracking');
                        }}
                        className={`p-1.5 rounded-lg border text-[10.5px] cursor-pointer transition-all ${
                          isPaid
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                        }`}
                        title={`${evt.applicationNo} - Installment #${evt.installmentNo}`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{formatCurrency(evt.totalDue)}</span>
                          <span className="text-[9px] uppercase font-mono">{evt.status}</span>
                        </div>
                        <div className="text-[10px] truncate text-slate-500 dark:text-slate-400">
                          {evt.applicationNo}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
