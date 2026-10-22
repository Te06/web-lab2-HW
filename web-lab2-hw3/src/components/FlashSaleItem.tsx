import type { FlashSaleItem as ItemType } from '../inventory-fsm';
import { LOCK_DURATION_MS } from '../inventory-fsm';

interface Props {
  item: ItemType;
  onBuy: (id: string) => void;
  onCheckout: (id: string) => void;
}

export function FlashSaleItem({ item, onBuy, onCheckout }: Props) {
  // Tính thời gian còn lại của lock (nếu có)
  let lockRemaining = 0;
  if (item.state === 'LOCKED' && item.lockedAt) {
    const elapsed = Date.now() - item.lockedAt;
    lockRemaining = Math.max(0, LOCK_DURATION_MS - elapsed);
  }

  return (
    <div style={{ border: '2px solid #333', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>{item.name}</h3>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {/* Hiển thị trạng thái dựa trên FSM */}
          {item.state === 'AVAILABLE' && <span style={{ color: '#006600', fontWeight: 'bold' }}>🟢 Còn hàng</span>}
          {item.state === 'LOCKED' && (
            <span style={{ color: '#cc6600', fontWeight: 'bold' }}>
              🟡 Đang giữ hàng ({(lockRemaining / 1000).toFixed(1)}s)
            </span>
          )}
          {item.state === 'SOLD' && <span style={{ color: '#cc0000', fontWeight: 'bold' }}>🔴 Đã bán</span>}
        </div>

        <div>
          {/* Nút bấm thay đổi theo State */}
          {item.state === 'AVAILABLE' && (
            <button 
              onClick={() => onBuy(item.id)} 
              aria-label={`Mua ${item.name}`} // Đã thêm Aria-label
              style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#0000cc', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Mua ngay
            </button>
          )}
          {item.state === 'LOCKED' && (
            <button 
              onClick={() => onCheckout(item.id)} 
              aria-label={`Thanh toán cho ${item.name}`} // Đã thêm Aria-label
              style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Thanh toán
            </button>
          )}
          {item.state === 'SOLD' && (
            <button 
              disabled 
              aria-label={`${item.name} đã hết hàng`} // Đã thêm Aria-label
              style={{ padding: '8px 16px', backgroundColor: '#ccc', color: '#666', border: 'none', borderRadius: '4px' }}
            >
              Hết hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}