import { useState, useEffect } from 'react';
import { InventoryFSM } from './inventory-fsm';
import type { FlashSaleItem as ItemType } from './inventory-fsm';
import { useAntiDriftTimer } from './use-anti-drift-timer';
import { FlashSaleItem } from './components/FlashSaleItem';

// Thời điểm kết thúc Flash Sale (ví dụ: 3 phút nữa)
const SALE_END_TIME = Date.now() + 3 * 60 * 1000;

const INITIAL_ITEMS: ItemType[] = [
  { id: '1', name: 'iPhone 15 Pro Max', state: 'AVAILABLE', lockedAt: null },
  { id: '2', name: 'Samsung Galaxy S24 Ultra', state: 'AVAILABLE', lockedAt: null },
  { id: '3', name: 'MacBook Pro M3', state: 'AVAILABLE', lockedAt: null },
  { id: '4', name: 'Sony PlayStation 5', state: 'AVAILABLE', lockedAt: null },
];

function App() {
  const [items, setItems] = useState<ItemType[]>(INITIAL_ITEMS);
  const { formatted, remaining } = useAntiDriftTimer(SALE_END_TIME);

  // Vòng lặp kiểm tra hết hạn Lock (Heartbeat)
  useEffect(() => {
    let rafId: number;
    const checkLocks = () => {
      setItems((prevItems) => {
        const newItems = prevItems.map(InventoryFSM.checkExpiry);
        const hasChanged = newItems.some((item, i) => item.state !== prevItems[i].state);
        return hasChanged ? newItems : prevItems;
      });
      rafId = requestAnimationFrame(checkLocks);
    };

    rafId = requestAnimationFrame(checkLocks);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleBuy = (id: string) => {
    setItems((prev) => prev.map(item => item.id === id ? InventoryFSM.lock(item) : item));
  };

  const handleCheckout = (id: string) => {
    setItems((prev) => prev.map(item => item.id === id ? InventoryFSM.checkout(item) : item));
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto', color: '#111' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>🔥 Flash Sale 11.11</h1>
        <div 
          style={{ fontSize: '2rem', color: '#cc0000', fontWeight: 'bold' }}
          aria-live="polite" 
          aria-label={`Thời gian kết thúc còn lại: ${formatted}`}
        >
          {remaining > 0 ? `Kết thúc sau: ${formatted}` : 'Đã kết thúc!'}
        </div>
      </header>

      <div>
        {items.map((item) => (
          <FlashSaleItem 
            key={item.id} 
            item={item} 
            onBuy={handleBuy} 
            onCheckout={handleCheckout} 
          />
        ))}
      </div>
    </main>
  );
}

export default App;