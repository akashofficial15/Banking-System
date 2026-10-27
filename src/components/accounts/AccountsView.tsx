import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { formatCurrency, maskAccountNumber } from '../../lib/formatters';
import {
  Wallet,
  CreditCard,
  Lock,
  Unlock,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
} from 'lucide-react';

export const AccountsView: React.FC = () => {
  const { accounts, primaryAccount } = useBank();
  const [showNumbers, setShowNumbers] = useState(false);
  const [isCardLocked, setIsCardLocked] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Retail Depository
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800/60">
              FDIC Insured up to $250k
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Accounts & Cards Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor balance allocations, routing numbers, and security controls.
          </p>
        </div>

        <button
          onClick={() => setShowNumbers(!showNumbers)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          {showNumbers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{showNumbers ? 'Hide Account Numbers' : 'Reveal Account Numbers'}</span>
        </button>
      </div>

      {/* Account Cards & Premium Nexora Debit Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Accounts List */}
        <div className="lg:col-span-2 space-y-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-brand-500/40"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {acc.accountName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                      <span>{showNumbers ? acc.accountNumber : maskAccountNumber(acc.accountNumber)}</span>
                      <button
                        onClick={() => handleCopy(acc.accountNumber, acc.id)}
                        className="text-slate-400 hover:text-brand-500"
                        title="Copy account number"
                      >
                        {copiedId === acc.id ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                  {acc.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-400 font-sans block">Total Balance</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatCurrency(acc.balance)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans block">Available to Withdraw</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(acc.availableBalance)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans block">Advance Hold / Escrow</span>
                  <span className="text-lg font-bold text-amber-500">
                    {formatCurrency(acc.heldAmount)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Col: Nexora Metal Platinum Card Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Virtual & Physical Card
              </span>
              <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400">
                Metal Elite
              </span>
            </div>

            {/* Visual Card */}
            <div className="relative rounded-2xl bg-gradient-to-tr from-navy-950 via-slate-900 to-brand-950 p-5 text-white shadow-xl border border-brand-900/40 overflow-hidden space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold tracking-widest text-brand-400">NEXORA</span>
                <span className="text-xs font-mono text-slate-400">DEBIT</span>
              </div>

              <div className="py-2">
                <div className="w-8 h-6 rounded bg-amber-400/80 mb-2"></div>
                <div className="font-mono text-sm tracking-widest text-slate-200">
                  •••• •••• •••• 9841
                </div>
              </div>

              <div className="flex justify-between items-end text-[10px] font-mono">
                <div>
                  <span className="text-slate-400 block font-sans">CARDHOLDER</span>
                  <span className="font-bold text-white uppercase">Sarah Jenkins</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans">EXPIRES</span>
                  <span className="font-bold text-white">09/29</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Card Freeze Protection:</span>
            <button
              onClick={() => setIsCardLocked(!isCardLocked)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                isCardLocked
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isCardLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isCardLocked ? 'Card Locked' : 'Card Active'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
