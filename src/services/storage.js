import { db } from './firebase';
import {
  collection, doc, getDocs, setDoc, deleteDoc, onSnapshot, writeBatch,
} from 'firebase/firestore';

export async function getAll(collectionName) {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribe(collectionName, callback) {
  const unsub = onSnapshot(
    collection(db, collectionName),
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items);
    },
    (error) => {
      console.error(`Lỗi đồng bộ dữ liệu collection "${collectionName}":`, error);
    },
  );
  return unsub;
}

export async function saveItem(collectionName, id, data) {
  await setDoc(doc(db, collectionName, id), data, { merge: true });
}

export async function saveMany(collectionName, dataArray) {
  const batch = writeBatch(db);
  dataArray.forEach((item) => {
    const docRef = doc(db, collectionName, item.id);
    batch.set(docRef, item, { merge: true });
  });
  await batch.commit();
}

export async function removeItem(collectionName, id) {
  await deleteDoc(doc(db, collectionName, id));
}

export async function replaceAll(collectionName, dataArray) {
  const existing = await getDocs(collection(db, collectionName));
  const batch = writeBatch(db);
  existing.docs.forEach((d) => batch.delete(d.ref));
  dataArray.forEach((item) => {
    const docRef = doc(db, collectionName, item.id);
    batch.set(docRef, item);
  });
  await batch.commit();
}

export async function uploadAvatar(studentId, base64DataUrl) {
  // Không dùng Firebase Storage — ảnh được lưu trực tiếp dạng base64 trong document Firestore
  return base64DataUrl;
}

export async function deleteAvatar() {
  // Không có file riêng trên Storage nên không cần xoá gì thêm
}

export async function importAllData(collectionNames, dataObject) {
  for (const name of collectionNames) {
    if (dataObject[name]) {
      await replaceAll(name, dataObject[name]);
    }
  }
}