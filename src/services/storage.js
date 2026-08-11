import { db, storage as fbStorage, isFirebaseConfigured } from './firebase';
import {
  collection, doc, getDocs, setDoc, deleteDoc, onSnapshot, writeBatch,
} from 'firebase/firestore';
import {
  ref, uploadString, getDownloadURL, deleteObject,
} from 'firebase/storage';

const MODE_KEY = 'lophoc_mode';
const LOCAL_PREFIX = 'lophoc_';
const localEmitter = new EventTarget();

export function getAppMode() {
  const saved = localStorage.getItem(MODE_KEY);
  if (saved === 'online' && isFirebaseConfigured()) return 'online';
  return 'offline';
}

export function setAppMode(mode) {
  localStorage.setItem(MODE_KEY, mode);
}

export function isOnlineAvailable() {
  return isFirebaseConfigured();
}

function localKey(collectionName) {
  return `${LOCAL_PREFIX}${collectionName}`;
}

function readLocal(collectionName) {
  try {
    const raw = localStorage.getItem(localKey(collectionName));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Lỗi đọc dữ liệu local:', e);
    return [];
  }
}

function writeLocal(collectionName, items) {
  localStorage.setItem(localKey(collectionName), JSON.stringify(items));
  localEmitter.dispatchEvent(new CustomEvent(collectionName));
}

export async function getAll(collectionName) {
  const mode = getAppMode();
  if (mode === 'online') {
    const snap = await getDocs(collection(db, collectionName));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  return readLocal(collectionName);
}

export function subscribe(collectionName, callback) {
  const mode = getAppMode();
  if (mode === 'online') {
    const unsub = onSnapshot(collection(db, collectionName), (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items);
    });
    return unsub;
  }
  callback(readLocal(collectionName));
  const handler = () => callback(readLocal(collectionName));
  localEmitter.addEventListener(collectionName, handler);
  window.addEventListener('storage', handler);
  return () => {
    localEmitter.removeEventListener(collectionName, handler);
    window.removeEventListener('storage', handler);
  };
}

export async function saveItem(collectionName, id, data) {
  const mode = getAppMode();
  if (mode === 'online') {
    await setDoc(doc(db, collectionName, id), data, { merge: true });
    return;
  }
  const items = readLocal(collectionName);
  const index = items.findIndex((item) => item.id === id);
  const record = { id, ...data };
  if (index >= 0) {
    items[index] = { ...items[index], ...record };
  } else {
    items.push(record);
  }
  writeLocal(collectionName, items);
}

export async function saveMany(collectionName, dataArray) {
  const mode = getAppMode();
  if (mode === 'online') {
    const batch = writeBatch(db);
    dataArray.forEach((item) => {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, item, { merge: true });
    });
    await batch.commit();
    return;
  }
  const items = readLocal(collectionName);
  dataArray.forEach((newItem) => {
    const index = items.findIndex((item) => item.id === newItem.id);
    if (index >= 0) {
      items[index] = { ...items[index], ...newItem };
    } else {
      items.push(newItem);
    }
  });
  writeLocal(collectionName, items);
}

export async function removeItem(collectionName, id) {
  const mode = getAppMode();
  if (mode === 'online') {
    await deleteDoc(doc(db, collectionName, id));
    return;
  }
  const items = readLocal(collectionName);
  writeLocal(collectionName, items.filter((item) => item.id !== id));
}

export async function replaceAll(collectionName, dataArray) {
  const mode = getAppMode();
  if (mode === 'online') {
    const existing = await getDocs(collection(db, collectionName));
    const batch = writeBatch(db);
    existing.docs.forEach((d) => batch.delete(d.ref));
    dataArray.forEach((item) => {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, item);
    });
    await batch.commit();
    return;
  }
  writeLocal(collectionName, dataArray);
}

export async function uploadAvatar(studentId, base64DataUrl) {
  const mode = getAppMode();
  if (mode === 'online' && fbStorage) {
    const storageRef = ref(fbStorage, `avatars/${studentId}.jpg`);
    await uploadString(storageRef, base64DataUrl, 'data_url');
    return getDownloadURL(storageRef);
  }
  return base64DataUrl;
}

export async function deleteAvatar(studentId) {
  const mode = getAppMode();
  if (mode === 'online' && fbStorage) {
    try {
      const storageRef = ref(fbStorage, `avatars/${studentId}.jpg`);
      await deleteObject(storageRef);
    } catch (e) {
      console.warn('Không tìm thấy ảnh để xoá:', e.message);
    }
  }
}

export function exportAllLocalData(collectionNames) {
  const result = {};
  collectionNames.forEach((name) => {
    result[name] = readLocal(name);
  });
  return result;
}

export async function importAllData(collectionNames, dataObject) {
  for (const name of collectionNames) {
    if (dataObject[name]) {
      await replaceAll(name, dataObject[name]);
    }
  }
}