import { useState, useMemo } from 'react';
import {
  useReactTable, getCoreRowModel, flexRender,
  getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
  SortingState, ColumnDef,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  title: string;
  searchPlaceholder?: string;
  rowClass?: (row: T) => string;
  showExport?: boolean;
}

export function DataTable<T>({ columns, data, title, searchPlaceholder = 'Search...', rowClass, showExport = true }: DataTableProps<T>) {
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

  const exportColumns = useMemo(
    () =>
      table
        .getAllLeafColumns()
        .filter((column) => column.getIsVisible() && column.id !== 'actions'),
    [table],
  );

  const csvFileName = useMemo(
    () => `${title.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '') || 'table-data'}.csv`,
    [title],
  );

  const pdfFileName = useMemo(
    () => `${title.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '') || 'table-data'}.pdf`,
    [title],
  );

  const getColumnHeader = (column: (typeof exportColumns)[number]) => {
    const header = column.columnDef.header;

    if (typeof header === 'string') {
      return header;
    }

    return column.id;
  };

  const getExportRows = () =>
    table.getFilteredRowModel().rows.map((row) =>
      exportColumns.map((column) => {
        const value = row.getValue(column.id);

        if (value === null || value === undefined) {
          return '';
        }

        return String(value);
      }),
    );

  const escapeCsv = (value: string) => {
    const safe = value.replace(/"/g, '""');
    return /[",\n]/.test(safe) ? `"${safe}"` : safe;
  };

  const handleExportCsv = () => {
    const headers = exportColumns.map(getColumnHeader);
    const rows = getExportRows();

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsv(cell)).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', csvFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const headers = exportColumns.map(getColumnHeader);
    const rows = getExportRows();

    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text(title, 14, 14);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 10, right: 10 },
    });

    doc.save(pdfFileName);
  };

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
          {showExport ? (
            <>
              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 bg-background border border-border text-sm font-medium hover:bg-muted transition-colors rounded whitespace-nowrap"
              >
                Export CSV
              </button>
              <button
                onClick={handleExportPdf}
                className="px-3 py-1.5 bg-background border border-border text-sm font-medium hover:bg-muted transition-colors rounded whitespace-nowrap"
              >
                Export PDF
              </button>
            </>
          ) : null}
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
                <tr key={row.id} className={`${rowClass ? rowClass(row.original) : ''} hover:bg-muted/50 transition-colors duration-150`} data-row-index={row.id}>
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
