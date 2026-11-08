import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, bootstrapApi } from '@/shared/api';
import { SessionContext } from './context';

/**
 * Магазин всегда объектом: демо (mock) хранит номер магазина, сервер (http) — магазин целиком.
 * Без этого у вошедшего в демо шапка падала на selectedStore.name (правка 06.11)
 */
const toStore = (v) => (v && typeof v === 'object' ? v : api.stores.find((s) => s.id === String(v)) ?? null);

/** Сессия пользователя и справочники. Единственное место, которое ходит в api. */
export function SessionProvider({ children }) {

  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [stores, setStores] = useState(api.stores);
  const [participants, setParticipants] = useState(api.participants);
  const [selectedStore, setSelectedStore] = useState(() => toStore(api.selectedStore()));

  const refresh = useCallback(async () => {
    const me = await api.me();
    setUser(me);

    if (me?.shops_id && !selectedStore) {
      const shopFromServer = api.stores.find(s => s.id === String(me.shops_id));
      if (shopFromServer) setSelectedStore(shopFromServer);
    } else if (!selectedStore) {
      // Демо: после входа магазин участника лежит в api.selectedStore() номером
      const local = toStore(api.selectedStore());
      if (local) setSelectedStore(local);
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
    setSelectedStore(null);
    setUser(null);
  }, []);

  const registerReceipt = useCallback(async (code, is_tornado = false) => {
    const res = await api.registerReceipt(code, is_tornado);
    await refresh();
    return res;
  }, [refresh]);

  const registerReceiptQr = useCallback(async (code) => {
    const res = await api.registerReceiptQr(code);
    await refresh();
    return res;
  }, [refresh]);

  const selectStore = useCallback(async (store) => {
    await api.selectStore(store);
    setSelectedStore(toStore(store));
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

