import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, bootstrapApi } from '@/shared/api';
import { SessionContext } from './context';

/** Сессия пользователя и справочники. Единственное место, которое ходит в api. */
export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [stores, setStores] = useState(api.stores);
  const [participants, setParticipants] = useState(api.participants);
  const [selectedStoreId, setSelectedStoreId] = useState(() => api.selectedStore());

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

  const login = useCallback(async (phone) => {
    const u = await api.login(phone);
    await refresh();
    return u;
  }, [refresh]);

  const register = useCallback(async (input) => {
    const u = await api.register(input);
    await refresh();
    return u;
  }, [refresh]);

  const logout = useCallback(async () => {
    await api.logout();
    await refresh();
  }, [refresh]);

  const registerReceipt = useCallback(async (number, channel) => {
    const res = await api.registerReceipt(number, channel);
    await refresh();
    return res;
  }, [refresh]);

  const selectStore = useCallback(async (storeId) => {
    await api.selectStore(storeId);
    setSelectedStoreId(storeId);
    if (user) await refresh();
  }, [refresh, user]);

  const value = useMemo(() => ({
    user, ready, stores, participants, selectedStoreId,
    selectedStore: stores.find((s) => s.id === selectedStoreId) ?? null,
    login, register, logout, registerReceipt, selectStore, refresh,
  }), [user, ready, stores, participants, selectedStoreId, login, register, logout, registerReceipt, selectStore, refresh]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

