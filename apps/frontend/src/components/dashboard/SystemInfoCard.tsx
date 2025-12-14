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
      <CardHeader>
        <CardTitle>System Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {item.label}
            </p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              {item.value || 'Not assigned'}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
