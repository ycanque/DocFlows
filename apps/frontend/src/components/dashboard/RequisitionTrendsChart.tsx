'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface RequisitionTrendsChartProps {
  data: Array<{
    date: string;
    count: number;
    label: string;
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = (props: any) => {
  const { active, payload } = props;
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {data.payload.label}
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Requisitions: <span className="font-semibold text-blue-600 dark:text-blue-400">{data.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function RequisitionTrendsChart({ data }: RequisitionTrendsChartProps) {
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Requisition Trends</CardTitle>
              <CardDescription>Last 3 months activity</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{totalCount}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total submissions</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No trend data available
            </p>
          </div>
        ) : (
          <div className="w-full h-75">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                <XAxis
                  dataKey="label"
                  stroke="#71717a"
                  style={{ fontSize: '12px' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  style={{ fontSize: '12px' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={(props) => <CustomTooltip {...props} />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Requisitions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
