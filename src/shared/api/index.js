/**
 * Точка входа слоя данных. Всё приложение обращается только к `api`.
 * Теперь всегда используется реальный сервер (http).
 */
import { httpApi, loadDictionaries } from './http';

export const api = httpApi;

/** Загружает справочники (магазины, статистику) при старте приложения. */
export async function bootstrapApi() {
  await loadDictionaries();
}

export { circleMarks, progressFromSteps, totalSteps, toUser } from './progress';