
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
      <CardHeader className="pb-1">
        <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4 sm:p-6 pt-2">
        {actions.map((action, index) => {
          const Icon = action.icon ||
            (action.title.toLowerCase().includes('requisition') ? FileText :
            action.title.toLowerCase().includes('payment') ? DollarSign :
            action.title.toLowerCase().includes('approval') ? CheckCircle : FileText);
          return (
            <button
              key={index}
              onClick={action.onClick}
              className="w-full text-left p-4 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 mt-1 text-zinc-400 flex-shrink-0" aria-hidden="true" />
                <div className="space-y-1">
                  <div className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-50">
                    {action.title}
                  </div>
                  <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
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
