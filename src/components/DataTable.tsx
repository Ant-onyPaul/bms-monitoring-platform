import React, { useMemo, useState } from 'react';
import { IconSearch, IconChevronUp, IconChevronDown, IconSort, IconClose } from './icons';

/* -----------------------------------------------------------------------------
   DataTable

   A records surface, not a grid of cards. Rows are 52px with generous column
   padding so a scan down the status column stays effortless, and the header is
   sticky because device lists grow past a screen quickly.

   Columns keep the original `accessor` contract — a key or a render function.
   Sorting is offered only for key-based columns, since a render function has no
   comparable underlying value.
   -------------------------------------------------------------------------- */

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  /** Aligns the cell and its header; use for numeric columns. */
  align?: 'left' | 'right';
  /** Narrows the column to its content. */
  compact?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  /** Extra controls rendered in the toolbar, left of the record count. */
  toolbar?: React.ReactNode;
  emptyTitle?: string;
  emptyHint?: string;
}

type SortState = { key: string; direction: 'asc' | 'desc' } | null;

export default function DataTable<T>({
  columns,
  data,
  searchPlaceholder = 'Search…',
  onRowClick,
  toolbar,
  emptyTitle = 'No records found',
  emptyHint = 'Try a different search term.',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState<SortState>(null);

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return data;
    return data.filter((row: any) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sort) return filteredData;
    const { key, direction } = sort;
    return [...filteredData].sort((a: any, b: any) => {
      const left = a[key];
      const right = b[key];
      if (left == null) return 1;
      if (right == null) return -1;
      const result =
        typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left).localeCompare(String(right), undefined, { numeric: true });
      return direction === 'asc' ? result : -result;
    });
  }, [filteredData, sort]);

  const toggleSort = (key: string) => {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  return (
    <div className="bg-surface border border-line rounded-[13px]
      shadow-[var(--shadow-e1),var(--edge-lit)] overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-line">
        <div className="relative flex-1 min-w-0 max-w-sm">
          <IconSearch
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full h-9 pl-9 pr-9 rounded-[9px] bg-veil-1 border border-line
              text-[13px] text-ink placeholder:text-ink-4
              transition-[border-color,box-shadow,background-color] duration-200
              hover:border-line-2 hover:bg-veil-2
              focus:outline-none focus:bg-veil-3 focus:border-brand
              focus:shadow-[0_0_0_3px_var(--color-brand-surface)]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 inline-flex items-center
                justify-center rounded-[6px] text-ink-4 hover:text-ink hover:bg-veil-3
                cursor-pointer transition-colors"
            >
              <IconClose size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 sm:ml-auto shrink-0">
          {toolbar}
          <span className="data-technical text-[11px] text-ink-4 whitespace-nowrap">
            {sortedData.length}
            <span className="text-ink-4">
              {sortedData.length !== data.length ? ` / ${data.length}` : ''}
            </span>
            <span className="ml-1 uppercase tracking-[0.08em]">records</span>
          </span>
        </div>
      </div>

      {/* Records */}
      <div className="overflow-x-auto scrollbar-fine">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-veil-1 border-b border-line">
              {columns.map((column, index) => {
                const sortable = typeof column.accessor !== 'function';
                const key = String(column.accessor);
                const isSorted = sort?.key === key;

                return (
                  <th
                    key={index}
                    scope="col"
                    className={`px-5 py-2.5 ${column.align === 'right' ? 'text-right' : ''} ${
                      column.compact ? 'w-px whitespace-nowrap' : ''
                    }`}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(key)}
                        className={`inline-flex items-center gap-1.5 label-technical cursor-pointer
                          transition-colors hover:text-ink-2 group
                          ${isSorted ? '!text-ink-2' : ''}`}
                      >
                        {column.header}
                        {isSorted ? (
                          sort!.direction === 'asc' ? (
                            <IconChevronUp size={11} />
                          ) : (
                            <IconChevronDown size={11} />
                          )
                        ) : (
                          <IconSort
                            size={11}
                            className="opacity-0 group-hover:opacity-50 transition-opacity"
                          />
                        )}
                      </button>
                    ) : (
                      <span className="label-technical">{column.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center">
                  <p className="text-[13.5px] font-medium text-ink-2">{emptyTitle}</p>
                  <p className="mt-1 text-[12.5px] text-ink-4">{emptyHint}</p>
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(row)}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onRowClick(row);
                    }
                  }}
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? 'button' : undefined}
                  className={`
                    border-b border-line last:border-b-0
                    transition-colors duration-100
                    ${
                      onRowClick
                        ? 'cursor-pointer hover:bg-veil-1 focus-visible:bg-veil-1 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand'
                        : ''
                    }
                  `}
                >
                  {columns.map((column, columnIndex) => (
                    <td
                      key={columnIndex}
                      className={`px-5 py-3.5 text-[13px] text-ink-2 align-middle ${
                        column.align === 'right' ? 'text-right' : ''
                      } ${column.compact ? 'whitespace-nowrap' : ''}`}
                    >
                      {typeof column.accessor === 'function'
                        ? column.accessor(row)
                        : ((row as any)[column.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
