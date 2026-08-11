import { downloadFile } from './helpers';

export function exportToCSV(filename, headers, rows) {
  const BOM = '\uFEFF';
  const escapeCell = (cell) => {
    const str = String(cell ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const headerLine = headers.map(escapeCell).join(',');
  const dataLines = rows.map((row) => row.map(escapeCell).join(','));
  const csvContent = BOM + [headerLine, ...dataLines].join('\r\n');
  downloadFile(filename, csvContent, 'text/csv;charset=utf-8;');
}