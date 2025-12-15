import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SystemInfoItem {
  label: string;
  value: string | null | undefined;
}

interface SystemInfoCardProps {
  items: SystemInfoItem[];
}

export default function SystemInfoCard({ items }: SystemInfoCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">System Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {item.label}
            </p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {item.value || (
                <span className="text-zinc-400 dark:text-zinc-500">Not assigned</span>
              )}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
