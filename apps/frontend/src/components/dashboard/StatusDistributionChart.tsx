'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface StatusDistributionChartProps {
  data: Array<{
    status: string;
    count: number;
    label: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#94a3b8',
  SUBMITTED: '#60a5fa',
  PENDING_APPROVAL: '#fbbf24',
  APPROVED: '#34d399',
  REJECTED: '#f87171',
  CANCELLED: '#64748b',
  COMPLETED: '#22c55e',
};

interface TooltipPayload {
  value: number;
  payload: {
    label: string;
  };
}

interface LegendPayload {
  value: string;
  color: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = (props: any) => {
  const { active, payload, totalCount } = props;
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {data.payload.label}
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Count: <span className="font-semibold">{data.value}</span>
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          {((data.value / totalCount) * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomLegend = (props: any) => {
  const { payload } = props;
  if (!payload) return null;
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            {entry.payload.label} ({entry.payload.count})
          </span>
        </div>
      ))}
    </div>
  );
};

export default function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle>Requisition Status Distribution</CardTitle>
            <CardDescription>Current breakdown by status</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No requisition data available
            </p>
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip content={(props) => <CustomTooltip {...props} totalCount={totalCount} />} />
                <Legend content={(props) => <CustomLegend {...props} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
