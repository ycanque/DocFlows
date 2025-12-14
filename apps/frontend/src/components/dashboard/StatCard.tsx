import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = 'text-white',
  iconBgColor = 'bg-blue-500'
}: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {title}
            </p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {value}
            </p>
          </div>
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg",
            iconBgColor
          )}>
            <Icon className={cn("h-6 w-6", iconColor)} aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
