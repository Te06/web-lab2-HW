import { useState } from 'react';
import type { DataGridProps } from '../types';

export function DataGrid<T>({ data, columns, onRowSelect, ariaLabel }: DataGridProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- XỬ LÝ SORT & FILTER & PAGINATION (Giữ nguyên) ---
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredData = sortedData.filter((item) =>
    columns.some((col) =>
      String(item[col.accessorKey]).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // --- XỬ LÝ BÀN PHÍM (KEYBOARD NAVIGATION) ---
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTableCellElement>,
    rowIndex: number,
    colIndex: number,
    rowData: T
  ) => {
    let nextRow = rowIndex;
    let nextCol = colIndex;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault(); // Ngăn trình duyệt tự cuộn trang
        nextRow = Math.max(0, rowIndex - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        nextRow = Math.min(currentData.length - 1, rowIndex + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        nextCol = Math.max(0, colIndex - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextCol = Math.min(columns.length - 1, colIndex + 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onRowSelect) onRowSelect(rowData);
        return; // Thoát ra, không di chuyển focus
      default:
        return;
    }

    // Di chuyển focus sang ô tiếp theo
    const nextCell = document.getElementById(`cell-${nextRow}-${nextCol}`);
    nextCell?.focus();
  };

  return (
    <div>
      {/* THANH TÌM KIẾM (FILTER) */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label htmlFor="search-input" style={{ fontWeight: 'bold', color: '#111' }}>Tìm kiếm:</label>
        <input
          id="search-input"
          type="text"
          placeholder="Nhập từ khóa..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ padding: '6px', border: '1px solid #767676', borderRadius: '4px', color: '#111' }}
        />
      </div>

      {/* BẢNG DỮ LIỆU */}
      <table role="grid" aria-label={ariaLabel} style={{ width: '100%', borderCollapse: 'collapse', color: '#111' }}>
        <thead>
          <tr role="row">
            {columns.map((col) => (
              <th key={String(col.accessorKey)} scope="col" role="columnheader" style={{ border: '1px solid #767676', padding: '8px', textAlign: 'left', backgroundColor: '#f0f0f0' }}>
                {col.sortable ? (
                  <button
                    type="button"
                    onClick={() => handleSort(col.accessorKey)}
                    style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', width: '100%', color: '#111' }}
                  >
                    {col.header}
                    {sortConfig?.key === col.accessorKey && (
                      <span aria-hidden="true">{sortConfig.direction === 'asc' ? '⬆️' : '⬇️'}</span>
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
          {currentData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '1rem', border: '1px solid #767676' }}>
                Không tìm thấy dữ liệu.
              </td>
            </tr>
          ) : (
            currentData.map((row, rowIndex) => (
              <tr key={rowIndex} role="row">
                {columns.map((col, colIndex) => (
                  <td
                    key={String(col.accessorKey)}
                    id={`cell-${rowIndex}-${colIndex}`} // ID để quản lý focus
                    role="gridcell"
                    tabIndex={0} // Cho phép ô nhận focus từ bàn phím
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex, row)}
                    style={{ 
                      border: '1px solid #767676', 
                      padding: '8px',
                      // Hiệu ứng viền khi focus bằng bàn phím (A11y)
                      outline: 'none', 
                    }}
                    // Dùng onFocus để thêm style viền xanh đậm, đảm bảo độ tương phản > 4.5:1
                    onFocus={(e) => e.currentTarget.style.outline = '3px solid #005fcc'}
                    onBlur={(e) => e.currentTarget.style.outline = 'none'}
                  >
                    {String(row[col.accessorKey])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* NÚT PHÂN TRANG (PAGINATION) */}
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          aria-label="Trang trước"
          style={{ padding: '6px 12px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', border: '1px solid #767676', backgroundColor: currentPage === 1 ? '#e0e0e0' : '#fff', color: '#111' }}
        >
          Trang trước
        </button>
        
        <span aria-live="polite" style={{ color: '#111' }}>
          Trang {currentPage} / {totalPages === 0 ? 1 : totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          aria-label="Trang sau"
          style={{ padding: '6px 12px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', border: '1px solid #767676', backgroundColor: currentPage === totalPages ? '#e0e0e0' : '#fff', color: '#111' }}
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}