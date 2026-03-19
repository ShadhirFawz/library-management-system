import { useState, useMemo } from 'react';
import {
  useReactTable, getCoreRowModel, flexRender,
  getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
  SortingState, ColumnDef,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

interface DataTableProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  title: string;
  searchPlaceholder?: string;
}

export function DataTable<T>({ columns, data, title, searchPlaceholder = 'Search...' }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="bg-card border border-border rounded overflow-hidden">
      <div className="px-4 lg:px-6 py-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="font-bold text-lg">{title}</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full sm:w-64 bg-background border border-border pl-10 pr-4 py-1.5 text-sm rounded focus:outline-none focus:border-accent"
            />
          </div>
          <button className="px-3 py-1.5 bg-background border border-border text-sm font-medium hover:bg-muted transition-colors rounded whitespace-nowrap">
            Export CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-muted border-b border-border">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 lg:px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer select-none whitespace-nowrap"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <ChevronUp className="h-3 w-3" />}
                      {header.column.getIsSorted() === 'desc' && <ChevronDown className="h-3 w-3" />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">No records found.</td></tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-muted/50 transition-colors duration-150">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 lg:px-6 py-3 text-sm whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 lg:px-6 py-3 border-t border-border flex items-center justify-between bg-muted">
        <span className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          {' · '}{table.getFilteredRowModel().rows.length} records
        </span>
        <div className="flex gap-2">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1 border border-border bg-card text-sm rounded disabled:opacity-50 transition-colors hover:bg-background">
            Prev
          </button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1 border border-border bg-card text-sm rounded disabled:opacity-50 transition-colors hover:bg-background">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
