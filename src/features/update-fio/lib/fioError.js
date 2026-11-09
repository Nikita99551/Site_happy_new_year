/** Проверка ФИО: хотя бы фамилия и имя, только буквы, дефис, апостроф и пробелы. Возвращает текст ошибки или '' */
export function fioError(value) {
  const words = value.split(' ').filter(Boolean);
  if (words.length < 2) return 'Введите фамилию, имя и отчество через пробел';
  if (!/^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё'’ -]*$/.test(value)) return 'В ФИО могут быть только буквы, пробел и дефис';
  return '';
}
