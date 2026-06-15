"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "يناير", revenue: 12000 },
  { month: "فبراير", revenue: 18000 },
  { month: "مارس", revenue: 14000 },
  { month: "أبريل", revenue: 24000 },
  { month: "مايو", revenue: 32000 },
  { month: "يونيو", revenue: 28000 },
];

export function RevenueChart() {
  return (
    <div className="h-[380px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient
              id="colorRevenue"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="#2563eb"
                stopOpacity={0.8}
              />

              <stop
                offset="95%"
                stopColor="#2563eb"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
