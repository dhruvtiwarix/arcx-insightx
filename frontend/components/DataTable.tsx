type Props = {
  columns: string[];
  rows: Record<string, unknown>[];
};

export default function DataTable({ columns, rows }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          {/* Column headers */}
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              {/* Row number column */}
              <th className="px-4 py-3 text-left text-gray-400 font-medium w-12">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-gray-700 font-semibold
                             whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Data rows */}
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Row number */}
                <td className="px-4 py-2 text-gray-400 text-xs">
                  {rowIndex + 1}
                </td>
                {columns.map((col) => (
                  <td
                    key={col}
                    className="px-4 py-2 text-gray-800 whitespace-nowrap"
                  >
                    {/* Show empty string for null/undefined values */}
                    {row[col] === null || row[col] === undefined
                      ? <span className="text-gray-300 italic">null</span>
                      : String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Footer showing row count */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        Showing {rows.length} rows
      </div>
    </div>
  );
}
