export async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function stripDiacritics(str) {
  return str
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function suggestUsername(name, existingUsernames = []) {
  const base = stripDiacritics(name)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') || 'hocsinh';
  const taken = existingUsernames.map((u) => u.toLowerCase());
  let candidate = base;
  let suffix = 1;
  while (taken.includes(candidate)) {
    candidate = `${base}${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export function generatePin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
