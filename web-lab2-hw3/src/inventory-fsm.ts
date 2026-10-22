export type ItemState = 'AVAILABLE' | 'LOCKED' | 'SOLD';

export interface FlashSaleItem {
  id: string;
  name: string;
  state: ItemState;
  lockedAt: number | null; // Lưu thời điểm lock để check hết hạn
}

export const LOCK_DURATION_MS = 5000; // Giữ hàng trong 5 giây

// Máy trạng thái (Finite State Machine)
export class InventoryFSM {
  // Hàm khóa hàng (Giữ chỗ)
  static lock(item: FlashSaleItem): FlashSaleItem {
    if (item.state !== 'AVAILABLE') return item;
    return { ...item, state: 'LOCKED', lockedAt: Date.now() };
  }

  // Hàm thanh toán
  static checkout(item: FlashSaleItem): FlashSaleItem {
    if (item.state !== 'LOCKED') return item;
    return { ...item, state: 'SOLD', lockedAt: null };
  }

  // Hàm kiểm tra hết hạn lock (Giải phóng hàng)
  static checkExpiry(item: FlashSaleItem): FlashSaleItem {
    if (item.state === 'LOCKED' && item.lockedAt) {
      const elapsed = Date.now() - item.lockedAt;
      if (elapsed > LOCK_DURATION_MS) {
        // Hết hạn -> Trả về AVAILABLE
        return { ...item, state: 'AVAILABLE', lockedAt: null };
      }
    }
    return item;
  }
}