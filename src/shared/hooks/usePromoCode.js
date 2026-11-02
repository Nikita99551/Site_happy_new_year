import { useState, useCallback, useRef } from "react";
import { request } from '@/shared/api/http.js';

export function usePromoCode() {
    const [promoCodes, setPromoCodes] = useState([]);
    const [loading, setLoading] = useState(false);

    const isFetching = useRef(false);

    const getPromoCodes = useCallback(async () => {
        if (isFetching.current) return;
        isFetching.current = true;
        setLoading(true);

        try {
            const res = await request('/promo_codes/me', { method: 'GET' });
            const rawData = Array.isArray(res?.data) ? res.data : [];

            // Преобразуем данные сервера в удобный формат для UI
            const formatted = rawData.map(group => ({
                about: group.about,
                codes: (group.promo_codes || []).map(code => ({
                    id: code.guid,
                    name: code.name,
                    step: code.step_number,
                }))
            }));

            setPromoCodes(formatted);
            return formatted;
        } catch (err) {
            console.error('Ошибка при загрузке промокодов:', err);
            return [];
        } finally {
            isFetching.current = false;
            setLoading(false);
        }
    }, []);

    return { promoCodes, loading, getPromoCodes };
}