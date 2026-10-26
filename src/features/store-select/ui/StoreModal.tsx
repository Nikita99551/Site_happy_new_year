import { useState } from 'react';
import { useSession } from '@/entities/user';
import { useModal, type ModalName } from '@/features/modal';
import { plural } from '@/shared/lib/text';
import { Button } from '@/shared/ui/button/Button';
import { Field } from '@/shared/ui/field/Field';
import { IconPin, IconSearch } from '@/shared/ui/icons/Icons';
import { Modal } from '@/shared/ui/modal/Modal';
import { useToast } from '@/shared/ui/toast/context';
import './StoreModal.scss';

/** Окно 10: выбор магазина. После выбора возвращает в окно, откуда пришли (returnTo). */
export function StoreModal({ open, returnTo }: { open: boolean; returnTo?: ModalName }) {
  const { open: openModal, close } = useModal();
  const { stores, selectedStoreId, selectStore } = useSession();
  const toast = useToast();
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const items = stores.filter((s) => !query || `${s.name} ${s.address}`.toLowerCase().includes(query));

  const choose = async (id: string) => {
    await selectStore(id);
    toast('Магазин выбран');
    if (returnTo) openModal(returnTo);
    else close();
  };

  return (
    <Modal
      id="m-store"
      open={open}
      onClose={close}
      ribbon="Ваш магазин"
      width={960}
      title="Выберите магазин"
      lead={<>Выберите свой магазин или откройте его группу MAX. В&nbsp;нём вы получите приз и&nbsp;сможете вступить в&nbsp;чат.</>}
      decor={<img className="modal__goat modal__goat--peek" src="/img/goat-peek.webp" alt="" width={230} height={266} style={{ right: 'auto', left: 90 }} />}
    >
      <Field label="Название, город или адрес" icon={<IconSearch />} type="search" name="q" autoComplete="off" placeholder="Бийск" maxLength={60} value={q} onChange={(e) => setQ(e.target.value)} className="store-search" />
      <p className="muted" style={{ fontWeight: 700, fontSize: 16 }}>{items.length ? `Нашли ${items.length} ${plural(items.length, 'магазин', 'магазина', 'магазинов')}` : 'Ничего не нашли, попробуйте другое слово'}</p>
      <div className="store-list">
        {items.map((s) => {
          const selected = s.id === selectedStoreId;
          return (
            <div key={s.id} className={`store${selected ? ' store--selected' : ''}`}>
              <span className="store__pin"><IconPin stroke="currentColor" /></span>
              <div><b>{s.name}</b><small>{s.address}</small></div>
              <Button small className="btn--primary" onClick={() => choose(s.id)}>{selected ? 'Выбран' : 'Выбрать'}</Button>
              {s.max
                ? <Button small variant="secondary" href={s.max} target="_blank" rel="noopener">Группа MAX</Button>
                : <Button small variant="secondary" onClick={() => toast('Ссылка на чат появится позже')}>Группа MAX</Button>}
            </div>
          );
        })}
      </div>
      <p className="modal__fill">ЗАПОЛНИТЬ: список всех магазинов и&nbsp;ссылки MAX</p>
    </Modal>
  );
}
