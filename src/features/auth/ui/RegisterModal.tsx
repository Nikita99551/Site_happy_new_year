import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/entities/user';
import { useModal } from '@/features/modal';
import { formatPhone, isValidPhone, normalizePhone } from '@/shared/lib/phone';
import { Button } from '@/shared/ui/button/Button';
import { Check, Field } from '@/shared/ui/field/Field';
import { IconPin } from '@/shared/ui/icons/Icons';
import { Modal } from '@/shared/ui/modal/Modal';
import { SoonLink } from '@/shared/ui/soon-link/SoonLink';
import { useToast } from '@/shared/ui/toast/context';

interface Errors { fullName?: string; phone?: string; store?: string; rules?: boolean; pd?: boolean }

/** Окно 06: регистрация. Два обязательных согласия — тексты из документа юристов. */
export function RegisterModal({ open }: { open: boolean }) {
  const { open: openModal, close, finishAuth } = useModal();
  const { register, selectedStore, selectedStoreId } = useSession();
  const toast = useToast();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [rules, setRules] = useState(false);
  const [pd, setPd] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  // При открытии ошибки сбрасываются (введённое остаётся: окно закрывается на время выбора магазина)
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setErrors({});
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (fullName.trim().length < 5) next.fullName = 'Введите фамилию, имя и отчество';
    if (!isValidPhone(phone)) next.phone = 'Введите 10 цифр номера, начиная с 9';
    if (!selectedStoreId) next.store = 'Выберите свой магазин';
    if (!rules) next.rules = true;
    if (!pd) next.pd = true;
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await register({ fullName: fullName.trim(), phone: normalizePhone(phone), storeId: selectedStoreId as string, consents: { pd: true, rules: true } });
      // Пришёл из кнопки чека — сразу окно чека на этой же странице; иначе — на свой маршрут
      const toReceipt = finishAuth();
      // Форма чистая для следующего человека (общий компьютер в магазине)
      setFullName('');
      setPhone('');
      setRules(false);
      setPd(false);
      toast('Кабинет создан. С наступающим!');
      if (!toReceipt) navigate('/route');
    } catch (err) {
      setErrors({ phone: err instanceof Error ? err.message : 'Не удалось зарегистрироваться' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      id="m-register"
      open={open}
      onClose={close}
      ribbon="Регистрация"
      width={680}
      title={<>Создайте кабинет для&nbsp;чеков и&nbsp;подарков</>}
      lead={<>Телефон&nbsp;— 10&nbsp;цифр, без&nbsp;8 и&nbsp;+7.</>}
      decor={<img className="modal__goat modal__goat--right" src="/img/goat-scroll.webp" alt="" width={460} height={962} />}
    >
      <form className="modal__form" noValidate onSubmit={submit}>
        <Field label="Фамилия, имя, отчество" type="text" name="fullName" autoComplete="name" placeholder="Введите ФИО полностью" maxLength={120} required value={fullName} onChange={(e) => setFullName(e.target.value)} error={errors.fullName} />
        <Field label="Номер телефона" prefix="+7" type="tel" name="phone" inputMode="numeric" autoComplete="tel-national" placeholder="9XX XXX XX XX" required value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} error={errors.phone} />
        <div className={`field${errors.store ? ' field--error' : ''}`}>
          <span className="field__label">Ваш магазин <a className="link" href="#" onClick={(e) => { e.preventDefault(); openModal('store', { returnTo: 'register' }); }}>Изменить</a></span>
          <button className="field__box" type="button" style={{ width: '100%', textAlign: 'left' }} onClick={() => openModal('store', { returnTo: 'register' })}>
            <IconPin />
            <span style={{ fontWeight: 600, fontSize: 20 }}>{selectedStore ? `${selectedStore.name.replace('Аникс ', '')} · ${selectedStore.address}` : 'Выберите магазин'}</span>
          </button>
          <span className="field__hint">Магазин нужен, чтобы показывать его новости и&nbsp;сообщество.</span>
          <span className="field__error" aria-live="polite">{errors.store}</span>
        </div>
        <Check name="consentRules" required checked={rules} onChange={(e) => setRules(e.target.checked)} error={errors.rules}>
          Я ознакомился(ась) и&nbsp;принимаю <SoonLink className="link">Правила акции</SoonLink> «Год Козы&nbsp;— лови призы»
        </Check>
        <Check name="consentPd" required checked={pd} onChange={(e) => setPd(e.target.checked)} error={errors.pd}>
          Я даю <SoonLink className="link">согласие на&nbsp;обработку моих персональных данных</SoonLink>
        </Check>
        <div className="modal__actions"><Button block type="submit" disabled={busy}>{busy ? 'Секунду…' : 'Зарегистрироваться'}</Button></div>
        <p className="modal__foot">Уже есть кабинет? <a className="link" href="#" onClick={(e) => { e.preventDefault(); openModal('login'); }}>Войти</a></p>
      </form>
    </Modal>
  );
}
