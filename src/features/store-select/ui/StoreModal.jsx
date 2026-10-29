import { useEffect, useRef, useState } from 'react';
import { useSession } from '@/entities/user';
import { useModal } from '@/features/modal';
import { plural } from '@/shared/lib/text';
import { Button } from '@/shared/ui/button/Button';
import { Field } from '@/shared/ui/field/Field';
import { IconPin, IconSearch } from '@/shared/ui/icons/Icons';
import { Modal } from '@/shared/ui/modal/Modal';
import { useToast } from '@/shared/ui/toast/context';
import { matchStore, queryWords } from '../lib/search';
import { api } from '@/shared/api'; // <-- Импортируем api, чтобы взять данные напрямую
import './StoreModal.scss';

export function StoreModal({ open, returnTo }) {
  const { open: openModal, close, back } = useModal();
  // Берем selectedStoreId и selectStore из сессии
  const { selectedStoreId, selectStore } = useSession();
  const toast = useToast();

  const [q, setQ] = useState('');
  // Берем список магазинов напрямую из api (там они лежат после getShops)
  // Если вдруг их там нет, берем из useSession (на случай если SessionProvider их прокидывает)
  const [shops, setShops] = useState(api.stores || []);
  const [isLoading, setIsLoading] = useState(!api.stores?.length);

  const words = queryWords(q);
  const items = shops.filter((s) => matchStore(s, words));
  const listRef = useRef(null);

  // Если при открытии окна магазинов нет (не успели загрузиться), запрашиваем их
  useEffect(() => {
    if (open && shops.length === 0) {
      setIsLoading(true);
      api.getShops().then((data) => {
        setShops(data);
        setIsLoading(false);
      }).catch(() => setIsLoading(false));
    }
  }, [open, shops.length]);

  // Выбранный магазин виден сразу: список прокручивается к нему
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      const list = listRef.current;
      const el = list?.querySelector('.store--selected');
      if (!list || !el || list.scrollHeight <= list.clientHeight) return;
      list.scrollTop += el.getBoundingClientRect().top - list.getBoundingClientRect().top - 8;
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const choose = async (store) => {
    try {
      await selectStore(store);
      toast('Магазин выбран');
      if (returnTo) openModal(returnTo);
      else close();
    } catch (e) {
      toast('Не удалось выбрать магазин');
      console.error(e);
    }
  };

  return (
      <Modal
          id="m-store"
          open={open}
          onClose={back}
          ribbon="Ваш магазин"
          width={960}
          title="Выберите магазин"
          lead={<>Выберите свой магазин или откройте его группу MAX. В&nbsp;нём вы получите приз и&nbsp;сможете вступить в&nbsp;чат.</>}
          decor={<img className="modal__goat modal__goat--peek" src="/img/goat-peek.webp" alt="" width={230} height={266} style={{ right: 'auto', left: 90 }} />}
      >
        <Field
            label="Название, город или адрес"
            icon={<IconSearch />}
            type="search"
            name="q"
            autoComplete="off"
            placeholder="Например, Славянский или Васильева 30"
            maxLength={60}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="store-search"
        />

        {isLoading ? (
            <p className="muted" style={{ fontWeight: 700, fontSize: 16 }}>Загрузка магазинов...</p>
        ) : (
            <>
              <p className="muted" style={{ fontWeight: 700, fontSize: 16 }}>
                {!words.length ? `Всего ${items.length} ${plural(items.length, 'магазин', 'магазина', 'магазинов')}` : items.length ? `Нашли ${items.length} ${plural(items.length, 'магазин', 'магазина', 'магазинов')}` : 'Ничего не нашли, попробуйте другое слово'}
              </p>

              <div ref={listRef} className="store-list">
                {items.map((s) => {
                  const selected = s.id === selectedStoreId;
                  // Подстраховка: если бэкенд прислал link_max вместо max, используем его
                  const maxLink = s.max || s.link_max;

                  return (
                      <div key={s.id} className={`store${selected ? ' store--selected' : ''}`}>
                        <span className="store__pin"><IconPin stroke="currentColor" /></span>
                        <div>
                          <b>{s.name}</b>
                          <small>{s.address}</small>
                        </div>
                        <Button small className="btn--primary" onClick={() => choose(s)}>
                          {selected ? 'Выбран' : 'Выбрать'}
                        </Button>
                        {maxLink
                            ? <Button small variant="secondary" href={maxLink} target="_blank" rel="noopener">Группа MAX</Button>
                            : <Button small variant="secondary" className="btn--off" disabled title="Ссылки на чат этого магазина пока нет">Группа MAX</Button>}
                      </div>
                  );
                })}
              </div>
            </>
        )}
      </Modal>
  );
}