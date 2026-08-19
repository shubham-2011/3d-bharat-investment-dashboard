"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { formatLakhs, RISK_COLORS } from "@/utils/formatters";

export function RiskVsRoiScatterChart({ data = [] }) {
  const riskLabels = ["", "Low", "Medium", "High"];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="p-2.5 rounded-md bg-stone-900 text-white text-xs border border-stone-800 space-y-1">
          <p className="font-sans font-semibold text-stone-200">{item.name}</p>
          <div className="flex gap-3 text-stone-400 font-mono text-[11px]">
            <span>ROI: <strong className="text-emerald-400">{item.roi}%</strong></span>
            <span>Funding: <strong className="text-blue-400">{formatLakhs(item.funding)}</strong></span>
          </div>
        </div>
      );
    }
    return null;
  };

  const getRiskColor = (riskVal) => {
    if (riskVal === 1) return RISK_COLORS.Low;
    if (riskVal === 2) return RISK_COLORS.Medium;
    return RISK_COLORS.High;
  };

  return (
    <div className="p-4 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3">
      <div className="border-b border-stone-100 dark:border-stone-800 pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
          Risk vs return
        </h3>
      </div>

      <div className="h-60 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#44403c" opacity={0.15} />
            <XAxis
              type="number"
              dataKey="risk"
              name="Risk Level"
              domain={[0, 4]}
              ticks={[1, 2, 3]}
              tickFormatter={(v) => riskLabels[v] || ""}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#a8a29e", fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="roi"
              name="ROI"
              unit="%"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#a8a29e", fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
            <Scatter name="Deals" data={data}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk)} opacity={0.8} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
