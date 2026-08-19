"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatLakhs } from "@/utils/formatters";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatMonthTick(tickItem) {
  if (!tickItem) return "";
  const parts = tickItem.split("-");
  if (parts.length === 2) {
    const m = parseInt(parts[1], 10);
    if (!isNaN(m) && m >= 1 && m <= 12) {
      return MONTH_NAMES[m - 1];
    }
  }
  return tickItem;
}

export function InvestmentGrowthChart({ data = [] }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2.5 rounded-md bg-stone-900 text-white text-xs border border-stone-800 space-y-0.5 font-mono">
          <p className="font-sans text-stone-400">{formatMonthTick(label)}</p>
          <p className="font-semibold text-blue-400">
            {formatLakhs(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3">
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
          Portfolio value, 12 months
        </h3>
        <span className="text-[11px] font-mono text-stone-400">₹ Lakhs</span>
      </div>

      <div className="h-64 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#44403c" opacity={0.15} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatMonthTick}
              tick={{ fill: "#a8a29e", fontSize: 11 }}
              dy={5}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#a8a29e", fontSize: 11 }}
              tickFormatter={(v) => `₹${v}L`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#1a56db"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
