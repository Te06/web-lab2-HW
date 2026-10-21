import type { DataGridProps } from '../types';

export function DataGrid<T>({ data, columns, ariaLabel }: DataGridProps<T>) {
  return (
    <table role="grid" aria-label={ariaLabel} style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr role="row">
          {columns.map((col) => (
            <th key={String(col.accessorKey)} scope="col" role="columnheader" style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>
              {/* Vì slide yêu cầu bấm vào header để sort, ta bọc nó trong nút button để tốt cho A11y */}
              {col.sortable ? (
                <button type="button" style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                  {col.header}
                </button>
              ) : (
                col.header
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} role="row">
            {columns.map((col) => (
              <td key={String(col.accessorKey)} role="gridcell" style={{ border: '1px solid #ccc', padding: '8px' }}>
                {String(row[col.accessorKey])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}