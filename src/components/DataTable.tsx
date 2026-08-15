import React, { useState } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T>({ columns, data, searchPlaceholder = 'Search...', onRowClick }: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  // Very basic search across all string/number fields in a row
  const filteredData = data.filter((row: any) => {
    return Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden shadow-lg backdrop-blur-sm">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/80">
        <div className="relative">
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="text-sm text-slate-400">
          Showing {filteredData.length} records
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-800/80 border-b border-slate-700">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 font-medium">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                  No records found.
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIdx) => (
                <tr 
                  key={rowIdx} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4">
                      {typeof col.accessor === 'function' ? col.accessor(row) : (row as any)[col.accessor]}
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
