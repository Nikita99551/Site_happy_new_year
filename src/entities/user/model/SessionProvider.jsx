import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, bootstrapApi } from '@/shared/api';
import { SessionContext } from './context';

/** Сессия пользователя и справочники. Единственное место, которое ходит в api. */
export function SessionProvider({ children }) {

  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [stores, setStores] = useState(api.stores);
  const [participants, setParticipants] = useState(api.participants);
  const [selectedStore, setSelectedStore] = useState(() => api.selectedStore());

  const refresh = useCallback(async () => {
    const me = await api.me();
    setUser(me);

    if (me?.shops_id && !selectedStore) {
      const shopFromServer = api.stores.find(s => s.id === String(me.shops_id));
      if (shopFromServer) setSelectedStore(shopFromServer);
    }
  }, [selectedStore]);

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
    return () => { alive = false; };
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

  const registerReceiptQr = useCallback(async (qr) => {
    const res = await api.registerReceiptQr(qr);
    await refresh();
    return res;
  }, [refresh]);

  const selectStore = useCallback(async (store) => {
    await api.selectStore(store);
    setSelectedStore(store);
    if (user) await refresh();
  }, [refresh, user]);

  const value = useMemo(() => ({
    user, ready, stores, participants,
    selectedStoreId: selectedStore?.id || null,
    selectedStore,
    login, register, logout, registerReceipt, registerReceiptQr, selectStore, refresh,
  }), [user, ready, stores, participants, selectedStore, login, register, logout, registerReceipt, registerReceiptQr, selectStore, refresh]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

