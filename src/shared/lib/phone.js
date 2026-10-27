/** Телефон на сайте: 10 цифр без 8 и +7, начинается с 9. */
export const PHONE_RE = /^9\d{9}$/;

/** Только цифры, не больше 10. Вставленный «+7 913…» или набранный «8913…» (11 цифр) приводится к 10 цифрам без кода страны */
export function normalizePhone(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 11 && /^[78]/.test(digits)) digits = digits.slice(1);
  return digits.slice(0, 10);
}

/** Маска для поля ввода: 9131234567 → '913 123 45 67' */
export function formatPhone(value) {
  const v = normalizePhone(value);
  const parts = [v.slice(0, 3), v.slice(3, 6), v.slice(6, 8), v.slice(8, 10)].filter(Boolean);
  return parts.join(' ');
}

export function isValidPhone(value) {
  return PHONE_RE.test(normalizePhone(value));
}
