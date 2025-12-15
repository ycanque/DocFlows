import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  description?: string;
  iconColor?: string;
  onClick?: () => void;
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon,
  trend,
  description,
  iconColor = 'text-blue-600 dark:text-blue-400',
  onClick,
}: StatCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-150",
        onClick ? "cursor-pointer hover:shadow-lg hover:scale-105" : "hover:shadow-md"
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800">
            <Icon className={cn("h-5 w-5", iconColor)} aria-hidden="true" />
          </div>
          {trend && (
            <Badge variant={trend.direction === 'up' ? 'success' : 'warning'} className="flex items-center gap-1">
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {value}
          </p>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {title}
          </p>
          {description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
