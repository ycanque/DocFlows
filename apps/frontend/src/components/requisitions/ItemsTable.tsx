import { RequestItem } from '@docflows/shared';

interface ItemsTableProps {
  items: RequestItem[];
}

export default function ItemsTable({ items }: ItemsTableProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
        No items added
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-300 uppercase tracking-wider"
              >
                Particulars
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-300 uppercase tracking-wider"
              >
                Specification
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-300 uppercase tracking-wider"
              >
                Quantity
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-300 uppercase tracking-wider"
              >
                Unit
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-zinc-600 dark:text-zinc-300 uppercase tracking-wider"
              >
                Unit Cost
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-zinc-600 dark:text-zinc-300 uppercase tracking-wider"
              >
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-700">
            {items.map((item, index) => (
              <tr key={item.id || index}>
                <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100 font-medium">
                  {item.particulars}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {item.specification || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                  {new Intl.NumberFormat('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  }).format(item.quantity || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                  {item.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-zinc-900 dark:text-zinc-100">
                  ₱{new Intl.NumberFormat('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(item.unitCost || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-zinc-900 dark:text-zinc-100 font-semibold">
                  ₱{new Intl.NumberFormat('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(item.subtotal || 0)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <td colSpan={5} className="px-6 py-3 text-right text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Total Cost:
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-zinc-900 dark:text-zinc-100 text-right">
                ₱{new Intl.NumberFormat('en-PH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(
                  items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0)
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
