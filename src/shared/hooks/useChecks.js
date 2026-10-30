import { useState, useRef, useCallback } from "react";
import { request } from '@/shared/api/http.js';

export function useChecks() {
    const [checksPending, setChecksPending] = useState([]);
    const [checksDone, setChecksDone] = useState([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [loadingDone, setLoadingDone] = useState(false);

    const pendingState = useRef({ offset: 0, hasMore: true, fetching: false });
    const doneState = useRef({ offset: 0, hasMore: true, fetching: false });

    const limit = 3;

    // Явно принимаем статус вторым аргументом
    const mapCheck = (c, forcedStatus) => ({
        id: c.guid,
        last4: c.raw_code_check ? c.raw_code_check.slice(-4) : '0000',
        at: c.datetime_create,
        steps: c.steps_count || 0, // Если null, будет 0
        status: forcedStatus,
    });

    const loadPending = useCallback(async (reset = false) => {
        const s = pendingState.current;
        if (s.fetching || (!s.hasMore && !reset)) return;
        s.fetching = true;
        setLoadingPending(true);

        const offset = reset ? 0 : s.offset;
        try {
            const res = await request(`/checks/me?limit=${limit}&offset=${offset}&is_moderated=false`, { method: 'GET' });
            const raw = Array.isArray(res?.data) ? res.data : [];

            if (raw.length < limit) s.hasMore = false;
            s.offset = offset + limit;

            // Передаем 'processing', так как это запрос с is_moderated=false
            const formatted = raw.map(c => mapCheck(c, 'processing'));
            setChecksPending(prev => reset ? formatted : [...prev, ...formatted]);
        } catch (err) {
            console.error('Ошибка pending:', err);
        } finally {
            s.fetching = false;
            setLoadingPending(false);
        }
    }, []);

    const loadDone = useCallback(async (reset = false) => {
        const s = doneState.current;
        if (s.fetching || (!s.hasMore && !reset)) return;
        s.fetching = true;
        setLoadingDone(true);

        const offset = reset ? 0 : s.offset;
        try {
            const res = await request(`/checks/me?limit=${limit}&offset=${offset}&is_moderated=true`, { method: 'GET' });
            const raw = Array.isArray(res?.data) ? res.data : [];

            if (raw.length < limit) s.hasMore = false;
            s.offset = offset + limit;

            // Передаем 'done', так как это запрос с is_moderated=true
            const formatted = raw.map(c => mapCheck(c, 'done'));
            setChecksDone(prev => reset ? formatted : [...prev, ...formatted]);
        } catch (err) {
            console.error('Ошибка done:', err);
        } finally {
            s.fetching = false;
            setLoadingDone(false);
        }
    }, []);

    const initialLoad = useCallback(() => {
        pendingState.current = { offset: 0, hasMore: true, fetching: false };
        doneState.current = { offset: 0, hasMore: true, fetching: false };
        loadPending(true);
        loadDone(true);
    }, [loadPending, loadDone]);

    const getMorePending = useCallback(() => loadPending(false), [loadPending]);
    const getMoreDone = useCallback(() => loadDone(false), [loadDone]);

    return {
        checksPending, getMorePending, loadingPending,
        checksDone, getMoreDone, loadingDone,
        initialLoad
    };
}