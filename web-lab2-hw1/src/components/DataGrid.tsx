import { useState } from 'react';
import type { DataGridProps } from '../types';

export function DataGrid<T>({ data, columns, ariaLabel }: DataGridProps<T>) {
  // 1. State lưu trạng thái sắp xếp: cột nào và chiều nào (tăng/giảm)
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);

  // 2. Hàm xử lý khi bấm vào Header
  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    // Nếu đang sắp xếp cột này theo tăng dần rồi, thì đổi sang giảm dần
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 3. Nhân bản mảng data và sắp xếp (không sửa trực tiếp vào prop data gốc)
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <table role="grid" aria-label={ariaLabel} style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr role="row">
          {columns.map((col) => (
            <th key={String(col.accessorKey)} scope="col" role="columnheader" style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>
              {col.sortable ? (
                <button 
                  type="button" 
                  onClick={() => handleSort(col.accessorKey)} // Gắn sự kiện click
                  style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {col.header}
                  {/* Hiển thị mũi tên nếu cột này đang được sắp xếp */}
                  {sortConfig?.key === col.accessorKey && (
                    <span>{sortConfig.direction === 'asc' ? '⬆️' : '⬇️'}</span>
                  )}
                </button>
              ) : (
                col.header
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {/* Dùng sortedData thay vì data gốc */}
        {sortedData.map((row, rowIndex) => (
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