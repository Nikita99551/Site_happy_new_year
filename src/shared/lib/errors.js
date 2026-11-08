/**
 * Текст ошибки для человека (правка 08.11 по замечаниям коллег: при регистрации на экране появилось
 * «Cannot read properties of undefined (reading 'trim')»). Свои ошибки сайта и сервера — по-русски, их показываем как есть.
 * Техническую ошибку браузера или программы (английский текст) не показываем: пишем понятную фразу, а подробности — в консоль.
 */
export function errorText(err, fallback = 'Что-то пошло не так. Попробуйте ещё раз') {
  const msg = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  if (msg && /[а-яё]/i.test(msg)) return msg;
  if (err) console.error(err);
  return fallback;
}
