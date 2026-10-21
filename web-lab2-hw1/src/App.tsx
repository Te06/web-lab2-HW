import { DataGrid } from './components/DataGrid';
import type { ColumnDef } from './types';

interface User {
  id: number;
  name: string;
  email: string;
}

const columns: ColumnDef<User>[] = [
  { header: 'ID', accessorKey: 'id', sortable: true },
  { header: 'Họ Tên', accessorKey: 'name', sortable: true },
  { header: 'Email', accessorKey: 'email', sortable: false },
];

const data: User[] = [
  { id: 1, name: 'Nguyen Van A', email: 'a@example.com' },
  { id: 2, name: 'Tran Thi B', email: 'b@example.com' },
  { id: 3, name: 'Le Van C', email: 'c@example.com' },
];

function App() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>HW1: Enterprise Data-Grid</h1>
      <DataGrid data={data} columns={columns} ariaLabel="Bảng danh sách người dùng" />
    </main>
  );
}

export default App;