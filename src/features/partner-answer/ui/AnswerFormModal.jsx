import { useId, useState } from 'react';
import { sendAnswer } from '@/entities/answer';
import { getPartner } from '@/entities/partner';
import { useModal } from '@/features/modal';
import { taskOfPartner } from '@/shared/config/campaign';
import { MEDIA_LIMITS } from '@/shared/lib/media';
import { Button } from '@/shared/ui/button/Button';
import { Check } from '@/shared/ui/field/Field';
import { Modal } from '@/shared/ui/modal/Modal';
import { MediaPick } from './MediaPick';
import './PartnerAnswers.scss';
import { errorText } from '@/shared/lib/errors';

/**
 * Окно «Ответ на задание партнёра» (правка 08.11). Поля — по заданию (PARTNER_TASKS[n].accepts): текст, фото, видео,
 * обязательные или по желанию. Отдельная галочка — согласие показать ответ на сайте с именем. После отправки — «Ответ
 * отправлен»: ответ на проверке, пока его видит только автор. Один ответ на задание. payload: { slug }.
 */
export function AnswerFormModal({ open }) {
  const { state, close, open: openModal } = useModal();
  const payload = state?.name === 'answer' ? state.payload : undefined;
  const textId = useId();

  const [slug, setSlug] = useState(payload?.slug ?? '');
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  // Другое задание или новое открытие после отправки — чистая форма (сброс при отрисовке, без эффекта)
  const reopenedAfterSend = open && !wasOpen && sent;
  if (open !== wasOpen) setWasOpen(open);
  if ((payload?.slug && payload.slug !== slug) || reopenedAfterSend) {
    if (payload?.slug) setSlug(payload.slug);
    setText('');
    setMedia(null);
    setConsent(false);
    setErrors({});
    setSent(false);
  }

  const task = taskOfPartner(slug);
  if (!task) return null;
  const partner = getPartner(slug);
  const { accepts } = task;
  const kinds = ['photo', 'video'].filter((k) => accepts[k]);
  const mediaRequired = kinds.some((k) => accepts[k] === 'required');
  const nothingRequired = !Object.values(accepts).includes('required');

  const validate = () => {
    const e = {};
    const t = text.trim();
    if (accepts.text === 'required' && !t) e.text = 'Напишите ответ';
    if (mediaRequired && !media) e.media = kinds.length > 1 ? 'Добавьте фото или видео' : kinds[0] === 'photo' ? 'Добавьте фото' : 'Добавьте видео';
    if (nothingRequired && !t && !media) e.media = 'Добавьте фото, видео или напишите пару слов';
    if (!consent) e.consent = 'Без этого согласия ответ нельзя показать на сайте';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await sendAnswer(slug, {
        text: text.trim(),
        photo: media?.kind === 'photo' ? media.file : null,
        video: media?.kind === 'video' ? media.file : null,
      });
      setSent(true);
    } catch (err) {
      setErrors({ form: errorText(err, 'Не получилось отправить. Попробуйте ещё раз') });
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <Modal id="m-answer" open={open} onClose={close} ribbon="Задание партнёра" width={600} center
        title="Ответ отправлен"
        lead={<>Спасибо! После проверки ваш ответ появится среди ответов участников на&nbsp;странице «{partner?.title}». Пока он на&nbsp;проверке, его видите только вы.</>}
        before={<div className="modal__icon answer-sent__icon" aria-hidden="true"><svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"><path d="M16 31l9 9 19-20" /></svg></div>}
      >
        <div className="modal__actions">
          <Button block onClick={close}>Хорошо</Button>
          <Button block variant="secondary" onClick={() => openModal('answers', { slug, focus: 'mine' })}>Посмотреть ответы участников</Button>
        </div>
      </Modal>
    );
  }

  const textLabel = accepts.text === 'required' ? 'Ваш ответ' : 'Пара слов к ответу';
  return (
    <Modal id="m-answer" open={open} onClose={close} ribbon="Задание партнёра" width={680} title={task.title} lead={task.task}>
      <form className="modal__form answer-form" onSubmit={submit} noValidate>
        {accepts.text && (
          <label className={`field field--area${errors.text ? ' field--error' : ''}`} htmlFor={textId}>
            <span className="field__label">
              {textLabel}{accepts.text !== 'required' && <span className="check__opt">по&nbsp;желанию</span>}
            </span>
            <span className="field__box">
              <textarea
                id={textId} value={text} maxLength={MEDIA_LIMITS.textMax} rows={accepts.text === 'required' ? 6 : 3}
                placeholder={accepts.text === 'required' ? 'Напишите здесь' : 'Например, кто на фото или что за блюдо'}
                onChange={(e) => { setText(e.target.value); if (errors.text) setErrors({ ...errors, text: '' }); }}
                aria-invalid={errors.text ? true : undefined}
              />
            </span>
            <span className="field__hint answer-form__count">{text.length} из&nbsp;{MEDIA_LIMITS.textMax} знаков</span>
            <span className="field__error" aria-live="polite">{errors.text}</span>
          </label>
        )}
        {kinds.length > 0 && (
          <MediaPick
            kinds={kinds} value={media} required={mediaRequired} error={errors.media}
            onChange={(m) => { setMedia(m); setErrors({ ...errors, media: '' }); }}
            onError={(msg) => setErrors({ ...errors, media: msg })}
          />
        )}
        <Check name="consentAnswer" checked={consent} error={errors.consent}
          onChange={(e) => { setConsent(e.target.checked); if (errors.consent) setErrors({ ...errors, consent: '' }); }}>
          Разрешаю показать мой ответ на&nbsp;сайте акции с&nbsp;моим именем и&nbsp;первой буквой фамилии
        </Check>
        {errors.consent && <p className="answer-form__error" aria-live="polite">{errors.consent}</p>}
        <p className="modal__note answer-form__note">Ответ появится после проверки. Изменить его потом нельзя.</p>
        {errors.form && <p className="answer-form__error" role="alert">{errors.form}</p>}
        <div className="modal__actions">
          <Button type="submit" block disabled={busy}>{busy ? 'Отправляем…' : 'Отправить ответ'}</Button>
        </div>
      </form>
    </Modal>
  );
}
