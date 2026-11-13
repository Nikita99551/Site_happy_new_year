import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '@/entities/user';
import { useModal } from '@/features/modal';
import { formatPhone, isValidPhone, normalizePhone } from '@/shared/lib/phone';
import { Button } from '@/shared/ui/button/Button';
import { Check, Field } from '@/shared/ui/field/Field';
import { IconPin } from '@/shared/ui/icons/Icons';
import { Modal } from '@/shared/ui/modal/Modal';
import { getImage } from '@/shared/lib/images';
import { errorText } from '@/shared/lib/errors';

/** Окно 06: регистрация. Два обязательных согласия — тексты из документа юристов. */
export function RegisterModal({ open }) {
    const { open: openModal, back } = useModal();
    const { register, selectedStore, selectedStoreId } = useSession();
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [rules, setRules] = useState(false);
    const [pd, setPd] = useState(false);
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    // При открытии ошибки сбрасываются (введённое остаётся: окно закрывается на время выбора магазина)
    const [wasOpen, setWasOpen] = useState(open);
    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) setErrors({});
    }

    const submit = async (e) => {
        e.preventDefault();
        const next = {};
        if (fullName.trim().length < 5) next.fullName = 'Введите фамилию, имя и отчество';
        if (!isValidPhone(phone)) next.phone = 'Введите 10 цифр номера, начиная с 9';
        if (!selectedStoreId) next.store = 'Выберите свой магазин';
        if (!rules) next.rules = true;
        if (!pd) next.pd = true;
        setErrors(next);
        if (Object.keys(next).length) return;
        setBusy(true);
        try {
            // Формируем данные строго по контракту сервера!
            await register({
                fio: fullName.trim(),
                phone_number: formatPhone(phone),
                shops_id: Number(selectedStoreId), // Сервер ждет число (0), передаем Number()
            });
            setFullName('');
            setPhone('');
            setRules(false);
            setPd(false);
            openModal('registered');
        } catch (err) {
            setErrors({ phone: errorText(err, 'Не удалось зарегистрироваться. Попробуйте ещё раз') });
        } finally {
            setBusy(false);
        }
    };

    return (
        <Modal
            id="m-register"
            open={open}
            onClose={back}
            ribbon="Регистрация"
            width={680}
            title={<>Создайте кабинет<span className="modal__title-more"> для&nbsp;чеков и&nbsp;подарков</span></>}
            lead={<>Телефон&nbsp;— 10&nbsp;цифр, без&nbsp;8 и&nbsp;+7.</>}
            decor={<img className="modal__goat modal__goat--right" src={getImage('goat-scroll.webp')} alt="" width={460} height={962} loading="lazy" decoding="async" />}
        >
            <form className="modal__form" noValidate onSubmit={submit}>
                {/* На невысоких экранах компьютера ФИО и телефон в один ряд — окно помещается без прокрутки */}
                <div className="modal__pair">
                    <Field label="Фамилия, имя, отчество" type="text" name="fullName" autoComplete="name" placeholder="Введите ФИО полностью" maxLength={120} required value={fullName} onChange={(e) => setFullName(e.target.value)} error={errors.fullName} />
                    <Field label="Номер телефона" prefix="+7" type="tel" name="phone" inputMode="numeric" autoComplete="tel-national" placeholder="9XX XXX XX XX" required value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} error={errors.phone} />
                </div>
                <div className={`field${errors.store ? ' field--error' : ''}`}>
                    <span className="field__label">Ваш магазин <button type="button" className="link" onClick={() => openModal('store', { returnTo: 'register' })}>Изменить</button></span>
                    <button className="field__box" type="button" style={{ width: '100%', textAlign: 'left' }} onClick={() => openModal('store', { returnTo: 'register' })}>
                        <IconPin />
                        <span className="field__value">
              {selectedStore?.name ? `${selectedStore.name.replace('Аникс ', '')} · ${selectedStore.address}` : 'Выберите магазин'}
            </span>
                    </button>
                    <span className="field__hint field__hint--optional">В&nbsp;этом магазине вы получите приз, если выиграете.</span>
                    <span className="field__error" aria-live="polite">{errors.store}</span>
                </div>
                <Check name="consentRules" required checked={rules} onChange={(e) => setRules(e.target.checked)} error={errors.rules}>
                    Я ознакомился(ась) и&nbsp;принимаю <Link className="link" to="/rules" target="_blank" rel="noopener">Правила акции</Link> «Год Козы&nbsp;— лови призы»
                </Check>
                <Check name="consentPd" required checked={pd} onChange={(e) => setPd(e.target.checked)} error={errors.pd}>
                    Я даю <Link className="link" to="/policy" target="_blank" rel="noopener">согласие на&nbsp;обработку моих персональных данных</Link>
                </Check>
                <div className="modal__actions"><Button block type="submit" disabled={busy}>{busy ? 'Секунду…' : 'Зарегистрироваться'}</Button></div>
                <p className="modal__foot">Уже есть кабинет? <button type="button" className="link" onClick={() => openModal('login')}>Войти</button></p>
            </form>
        </Modal>
    );
}
