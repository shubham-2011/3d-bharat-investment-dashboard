"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { INDUSTRY_COLORS, formatLakhs } from "@/utils/formatters";

export function IndustryDistributionChart({ data = [] }) {
  const totalValue = data.reduce((s, d) => s + (d.value || 0), 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="p-2.5 rounded-md bg-stone-900 text-white text-xs border border-stone-800 space-y-0.5 font-mono">
          <p className="font-sans text-stone-300">{item.industry}</p>
          <p className="font-semibold text-blue-400">
            {formatLakhs(item.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3">
      <div className="border-b border-stone-100 dark:border-stone-800 pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
          Capital split by sector
        </h3>
      </div>

      <div className="h-48 w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={68}
              paddingAngle={3}
              dataKey="value"
              nameKey="industry"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={INDUSTRY_COLORS[entry.industry] || "#78716c"}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* D13: Donut Center Value & Microlabel */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm font-semibold font-mono text-stone-900 dark:text-stone-100">
            {formatLakhs(totalValue)}
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            TOTAL
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
        {data.map((item) => (
          <div key={item.industry} className="flex items-center gap-1.5 text-[11px]">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor: INDUSTRY_COLORS[item.industry] || "#78716c",
              }}
            />
            <span className="text-stone-600 dark:text-stone-400 truncate">
              {item.industry}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
