/**
 * Точка входа слоя данных. Всё приложение обращается только к `api`.
 * Режим выбирается переменной окружения VITE_API_MODE: 'mock' (по умолчанию) или 'http'.
 */
import { httpApi, loadDictionaries } from './http';
import { mockApi } from './mock';

export const API_MODE = import.meta.env.VITE_API_MODE === 'http' ? 'http' : 'mock';

console.log("API_MODE",API_MODE)
console.log("import.meta.env.VITE_API_MODE", import.meta.env.VITE_API_MODE)

export const api = API_MODE === 'http' ? httpApi : mockApi;

console.log("api",api)

/** В режиме http подгружает справочники (магазины, статистику); в mock ничего не делает. */
export async function bootstrapApi() {

  console.log(" mock ничего не делает")

  if (API_MODE === 'http') await loadDictionaries();
  else resetDemoFromUrl();
}

/**
 * Демо-режим: ?demo-reset в адресе стирает демо-данные (чеки, шаги, вход) и память анимации — снова первый визит.
 * На настоящем сервере ничего не делает: там данные живут в базе.
 */
function resetDemoFromUrl() {
  if (!/[?&]demo-reset/.test(location.search)) return;
  try {
    for (const key of ['anix_demo', 'anix_route_seen']) localStorage.removeItem(key);
  } catch {
    /* приватный режим: хранить нечего */
  }
  const rest = location.search.replace(/[?&]demo-reset(=[^&]*)?/, '').replace(/^&/, '?');
  history.replaceState(history.state, '', location.pathname + rest + location.hash);
}

export { circleMarks, progressFromSteps, totalSteps, toUser } from './progress';
