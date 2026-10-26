import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, bootstrapApi, type ReceiptChannel, type RegisterInput, type Store, type User } from '@/shared/api';
import { SessionContext, type SessionValue } from './context';

/** Сессия пользователя и справочники. Единственное место, которое ходит в api. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [stores, setStores] = useState<Store[]>(api.stores);
  const [participants, setParticipants] = useState<number[]>(api.participants);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(() => api.selectedStore());

  const refresh = useCallback(async () => {
    const me = await api.me();
    setUser(me);
    setSelectedStoreId(api.selectedStore() ?? me?.storeId ?? null);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await bootstrapApi();
        if (!alive) return;
        setStores(api.stores);
        setParticipants(api.participants);
        await refresh();
      } catch (e) {
        console.error('Не удалось загрузить данные акции', e);
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [refresh]);

  const login = useCallback(async (phone: string) => {
    const u = await api.login(phone);
    await refresh();
    return u;
  }, [refresh]);

  const register = useCallback(async (input: RegisterInput) => {
    const u = await api.register(input);
    await refresh();
    return u;
  }, [refresh]);

  const logout = useCallback(async () => {
    await api.logout();
    await refresh();
  }, [refresh]);

  const registerReceipt = useCallback(async (number: string, channel: ReceiptChannel) => {
    const res = await api.registerReceipt(number, channel);
    await refresh();
    return res;
  }, [refresh]);

  const selectStore = useCallback(async (storeId: string) => {
    await api.selectStore(storeId);
    setSelectedStoreId(storeId);
    if (user) await refresh();
  }, [refresh, user]);

  const value = useMemo<SessionValue>(() => ({
    user, ready, stores, participants, selectedStoreId,
    selectedStore: stores.find((s) => s.id === selectedStoreId) ?? null,
    login, register, logout, registerReceipt, selectStore, refresh,
  }), [user, ready, stores, participants, selectedStoreId, login, register, logout, registerReceipt, selectStore, refresh]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

