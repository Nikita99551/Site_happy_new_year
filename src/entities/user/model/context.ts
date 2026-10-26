import { createContext, useContext } from 'react';
import type { ReceiptChannel, ReceiptResult, RegisterInput, Store, User } from '@/shared/api';

export interface SessionValue {
  /** Вошедший пользователь или null (гость) */
  user: User | null;
  /** Справочники загружены, можно показывать персональные блоки */
  ready: boolean;
  stores: Store[];
  participants: number[];
  /** Выбранный магазин (и у гостя тоже) */
  selectedStoreId: string | null;
  selectedStore: Store | null;
  login(phone: string): Promise<User>;
  register(input: RegisterInput): Promise<User>;
  logout(): Promise<void>;
  registerReceipt(number: string, channel: ReceiptChannel): Promise<ReceiptResult>;
  selectStore(storeId: string): Promise<void>;
  /** Перечитать пользователя с сервера */
  refresh(): Promise<void>;
}

export const SessionContext = createContext<SessionValue | null>(null);

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession можно вызывать только внутри SessionProvider');
  return ctx;
}
