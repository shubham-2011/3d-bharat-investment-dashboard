"use client";

import { scoreDeal } from "@/utils/scoring";
import { X, Sparkles, ShieldCheck, PieChart, Wallet, TrendingUp } from "lucide-react";

export function MatchBreakdownModal({ deal, investor, onClose }) {
  if (!deal || !investor) return null;

  const { total, breakdown } = scoreDeal(deal, investor);

  const criteria = [
    {
      title: "Risk Compatibility",
      score: breakdown.risk,
      max: 30,
      icon: ShieldCheck,
      desc: `Target risk level (${deal.riskLevel}) vs investor preference (${investor.riskAppetite})`,
    },
    {
      title: "Industry Preference",
      score: breakdown.industry,
      max: 25,
      icon: PieChart,
      desc: investor.preferredIndustries.includes(deal.industry)
        ? `Industry (${deal.industry}) is in your preferred list`
        : `Industry (${deal.industry}) is outside preferred list`,
    },
    {
      title: "Budget Fit",
      score: breakdown.budget,
      max: 25,
      icon: Wallet,
      desc: `Your budget (${investor.budget}L) relative to min entry (${deal.minInvestment}L)`,
    },
    {
      title: "ROI Attractiveness",
      score: breakdown.roi,
      max: 20,
      icon: TrendingUp,
      desc: `Yield rating (${deal.roi}% projected return)`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              Recommendation Match Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {deal.projectName} for {investor.name}
            </p>
          </div>
        </div>

        {/* Overall Score Circle */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-inner">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Overall Compatibility
            </span>
            <div className="text-3xl font-black text-emerald-400">
              {total}% <span className="text-xs text-slate-300 font-medium">Match</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Weighted Algorithm</span>
            <span className="text-xs font-semibold text-blue-400">100 Pts Standard</span>
          </div>
        </div>

        {/* Criteria List */}
        <div className="space-y-3">
          {criteria.map((item) => {
            const Icon = item.icon;
            const percentage = Math.round((item.score / item.max) * 100);
            return (
              <div
                key={item.title}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <Icon className="w-4 h-4 text-blue-500" />
                    {item.title}
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {item.score} / {item.max} pts
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {item.desc}
                </p>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-sm transition-colors cursor-pointer"
        >
          Got It
        </button>
      </div>
    </div>
  );
}
