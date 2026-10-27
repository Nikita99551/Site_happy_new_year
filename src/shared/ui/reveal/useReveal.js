import { useLayoutEffect } from 'react';
import { observeReveal } from './reveal';

/**
 * Включает появление .reveal-блоков на странице. Вызывается в каждом page-компоненте после рендера;
 * зависимости — данные, после загрузки которых появляются новые .reveal-элементы.
 */
export function useReveal(deps = []) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => observeReveal(), deps);
}
