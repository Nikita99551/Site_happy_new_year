import { Fragment, useMemo, useEffect, useRef, useCallback } from 'react';
import { circleMarks } from '@/shared/api';
import { useNow } from '@/shared/lib/hooks';
import { circleName, formatWhen, inCircle, plural } from '@/shared/lib/text';
import { useChecks } from "@/shared/hooks/useChecks.js";

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function ReceiptHistory({ user }) {
    const {
        checksPending, getMorePending, loadingPending,
        checksDone, getMoreDone, loadingDone,
        initialLoad
    } = useChecks();

    useEffect(() => {
        if (user) initialLoad();
    }, [user, initialLoad]);

    const receiptsForMath = useMemo(() => user?.receipts ?? [], [user]);
    const marks = useMemo(() => circleMarks(receiptsForMath), [receiptsForMath]);
    const now = useNow();
    const pendingCount = receiptsForMath.filter((r) => r.status === 'processing').length;

    // Стабильные ссылки на функции
    const loadMorePendingRef = useRef(getMorePending);
    const loadMoreDoneRef = useRef(getMoreDone);

    useEffect(() => { loadMorePendingRef.current = getMorePending; }, [getMorePending]);
    useEffect(() => { loadMoreDoneRef.current = getMoreDone; }, [getMoreDone]);

    // Обсерверы (создаются один раз)
    const observerPending = useRef(null);
    const observerDone = useRef(null);

    const lastPendingRef = useCallback((node) => {
        if (observerPending.current) observerPending.current.disconnect();
        if (!node) return;
        observerPending.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) loadMorePendingRef.current();
        }, { threshold: 0.1 });
        observerPending.current.observe(node);
    }, []);

    const lastDoneRef = useCallback((node) => {
        if (observerDone.current) observerDone.current.disconnect();
        if (!node) return;
        observerDone.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) loadMoreDoneRef.current();
        }, { threshold: 0.1 });
        observerDone.current.observe(node);
    }, []);

    const renderCheck = (r, isLast, refCallback) => {
        const isPending = r.status === 'processing';
        return (
            <Fragment key={r.id}>
                {[...(marks.get(r.id) ?? [])].reverse().map((c) => (
                    <p key={c} className="receipt__circle"><span>★ {cap(circleName(c))} круг пройден — билет на розыгрыш</span></p>
                ))}
                <div
                    className={`receipt__row${isPending ? ' receipt__row--pending' : ''}`}
                    ref={isLast ? refCallback : null}
                >
                    <div>
                        <b>Чек •••• {r.last4}</b>
                        <small><time dateTime={r.at}>{formatWhen(r.at, now)}</time></small>
                    </div>
                    <span className="receipt__steps">
                        {isPending ? '—' : `+${r.steps} ${plural(r.steps, 'шаг', 'шага', 'шагов')}`}
                    </span>
                    <span className={`pill${isPending ? ' pill--pending' : ''}`}>
                        {isPending ? 'Обрабатывается' : 'Зачислено'}
                    </span>
                    {isPending && <p className="receipt__note">Чек зарегистрирован сразу после покупки. Шаги появятся, как только он обработается.</p>}
                </div>
            </Fragment>
        );
    };

    if (!user) {
        return (
            <div className="receipt">
                <h2>История чеков</h2>
                <p className="receipt__sub">Все ваши чеки, новые сверху</p>
                <p className="receipt__note" style={{ padding: '20px 0' }}>Войдите, чтобы увидеть свои чеки.</p>
            </div>
        );
    }

    return (
        <div className="receipt">
            <h2>История чеков</h2>
            <p className="receipt__sub">Все ваши чеки, новые сверху</p>

            <div className="receipt__scroll">
                <div className="receipt__list">
                    {/* СПИСОК 1: В обработке */}
                    {checksPending.map((r, index) =>
                        renderCheck(r, index === checksPending.length - 1, lastPendingRef)
                    )}
                    {loadingPending && <p className="receipt__note" style={{ textAlign: 'center' }}>Загрузка...</p>}

                    {/* СПИСОК 2: Зачисленные */}
                    {checksDone.map((r, index) =>
                        renderCheck(r, index === checksDone.length - 1, lastDoneRef)
                    )}
                    {loadingDone && <p className="receipt__note" style={{ textAlign: 'center' }}>Загрузка...</p>}

                    {!loadingPending && !loadingDone && checksPending.length === 0 && checksDone.length === 0 && (
                        <p className="receipt__note" style={{ padding: '20px 0' }}>Чеков пока нет. Зарегистрируйте первый.</p>
                    )}
                </div>
            </div>

            {receiptsForMath.length > 0 && (
                <div className="receipt__sum">
                    <p>
                        <b>Зачислено {user.totalSteps} {plural(user.totalSteps, 'шаг', 'шага', 'шагов')}</b>
                        {' '}за {user.receiptsTotal} {plural(user.receiptsTotal, 'чек', 'чека', 'чеков')}
                        {pendingCount > 0 && <> ({pendingCount} в обработке)</>}
                    </p>
                    <p>
                        {user.circlesDone > 0
                            ? user.step === 30
                                ? <>Это {user.circlesDone} {plural(user.circlesDone, 'полный круг', 'полных круга', 'полных кругов')}: звезда горит, следующий чек начнёт новый круг</>
                                : <>Это {user.circlesDone} {plural(user.circlesDone, 'пройденный круг', 'пройденных круга', 'пройденных кругов')} по 30 шагов и {user.step} {plural(user.step, 'шаг', 'шага', 'шагов')} {inCircle(user.circle)}</>
                            : <>Все шаги — {inCircle(1)}</>}
                    </p>
                    {(checksPending.length + checksDone.length) > 4 && <p className="receipt__hint">Листайте список ↓</p>}
                </div>
            )}
            <p className="receipt__sign">С наступающим Новым годом!</p>
        </div>
    );
}