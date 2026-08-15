export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Làm sạch HTML soạn thảo (câu trả lời tự luận) trước khi hiển thị để tránh XSS
const ALLOWED_TAGS = new Set([
  'H1', 'H2', 'H3', 'P', 'BR', 'DIV', 'SPAN', 'UL', 'OL', 'LI', 'STRONG', 'B', 'EM', 'I', 'U',
]);

export function sanitizeRichHtml(html) {
  if (!html || typeof document === 'undefined') return '';
  const template = document.createElement('template');
  template.innerHTML = html;
  const walk = (node) => {
    const children = Array.from(node.childNodes);
    children.forEach((child) => {
      if (child.nodeType === 1) {
        if (!ALLOWED_TAGS.has(child.tagName)) {
          // Thay thẻ không cho phép bằng nội dung text của nó
          child.replaceWith(document.createTextNode(child.textContent || ''));
          return;
        }
        // Xoá mọi thuộc tính (kể cả on*, style, href) cho an toàn
        Array.from(child.attributes).forEach((attr) => child.removeAttribute(attr.name));
        walk(child);
      }
    });
  };
  walk(template.content);
  return template.innerHTML;
}

export function formatDateVN(date) {
  const d = new Date(date);
  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return `${dayNames[d.getDay()]}, ngày ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

export function getWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function parsePastedStudentList(rawText) {
  if (!rawText) return [];
  const lines = rawText.split(/\r?\n/);
  const names = [];
  const prefixRegex = /^\s*(\d+)\s*[.)\-:]?\s*/;
  lines.forEach((line) => {
    let clean = line.trim();
    if (!clean) return;
    clean = clean.replace(prefixRegex, '').trim();
    if (clean) {
      names.push(clean);
    }
  });
  return names;
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const GROUP_COLORS = {
  'Tổ 1': { bg: 'bg-happy-pink', text: 'text-white', light: 'bg-pink-100 text-pink-700' },
  'Tổ 2': { bg: 'bg-happy-blue', text: 'text-white', light: 'bg-blue-100 text-blue-700' },
  'Tổ 3': { bg: 'bg-happy-green', text: 'text-white', light: 'bg-green-100 text-green-700' },
  'Tổ 4': { bg: 'bg-happy-orange', text: 'text-white', light: 'bg-orange-100 text-orange-700' },
};

export function getAvatarFallback(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts[parts.length - 1][0].toUpperCase();
}

export function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
export function resizeImageFile(file, maxSize = 300, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}