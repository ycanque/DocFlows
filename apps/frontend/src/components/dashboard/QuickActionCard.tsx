
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { FileText, DollarSign, CheckCircle } from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  onClick: () => void;
  icon?: React.ElementType;
}

interface QuickActionCardProps {
  actions: QuickAction[];
}

export default function QuickActionCard({ actions }: QuickActionCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 p-6 pt-0">
        {actions.map((action, index) => {
          const Icon = action.icon ||
            (action.title.toLowerCase().includes('requisition') ? FileText :
            action.title.toLowerCase().includes('payment') ? DollarSign :
            action.title.toLowerCase().includes('approval') ? CheckCircle : FileText);
          return (
            <button
              key={index}
              onClick={action.onClick}
              className="w-full text-left p-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all duration-150 group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-100 group-hover:bg-white dark:bg-zinc-800 dark:group-hover:bg-zinc-700 transition-colors">
                  <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
                    {action.title}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {action.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
