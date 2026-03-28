// ═══════════════════════════════════════════════
//  FIREBASE CONFIG — Baark Wendé Store
//  Remplacez les valeurs ci-dessous par celles
//  de VOTRE projet Firebase
// ═══════════════════════════════════════════════

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// 🔴 REMPLACEZ CES VALEURS PAR LES VÔTRES (voir guide ci-dessous)
const firebaseConfig = {
  apiKey:            "VOTRE_API_KEY",
  authDomain:        "VOTRE_PROJECT.firebaseapp.com",
  projectId:         "VOTRE_PROJECT_ID",
  storageBucket:     "VOTRE_PROJECT.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId:             "VOTRE_APP_ID"
};

// Initialisation
const app     = initializeApp(firebaseConfig);
const db      = getFirestore(app);
const storage = getStorage(app);

// ── PRODUITS ──────────────────────────────────
export async function getProducts() {
  const snap = await getDocs(query(collection(db,"products"), orderBy("createdAt","desc")));
  return snap.docs.map(d => ({ ...d.data(), fireId: d.id }));
}

export function listenProducts(callback) {
  return onSnapshot(
    query(collection(db,"products"), orderBy("createdAt","desc")),
    snap => callback(snap.docs.map(d => ({ ...d.data(), fireId: d.id })))
  );
}

export async function addProduct(product) {
  const doc_ = await addDoc(collection(db,"products"), {
    ...product,
    createdAt: new Date().toISOString()
  });
  return doc_.id;
}

export async function updateProduct(fireId, data) {
  await updateDoc(doc(db,"products", fireId), data);
}

export async function deleteProduct(fireId) {
  await deleteDoc(doc(db,"products", fireId));
}

// ── COMMANDES ─────────────────────────────────
export function listenOrders(callback) {
  return onSnapshot(
    query(collection(db,"orders"), orderBy("createdAt","desc")),
    snap => callback(snap.docs.map(d => ({ ...d.data(), fireId: d.id })))
  );
}

export async function addOrder(order) {
  await addDoc(collection(db,"orders"), {
    ...order,
    createdAt: new Date().toISOString()
  });
}

export async function updateOrderStatus(fireId, status) {
  await updateDoc(doc(db,"orders", fireId), { status });
}

// ── PHOTOS ────────────────────────────────────
export async function uploadPhoto(file, productName) {
  const path = `products/${productName}_${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// ── AVIS ──────────────────────────────────────
export function listenReviews(callback) {
  return onSnapshot(
    query(collection(db,"reviews"), orderBy("createdAt","desc")),
    snap => callback(snap.docs.map(d => ({ ...d.data(), fireId: d.id })))
  );
}

export async function deleteReview(fireId) {
  await deleteDoc(doc(db,"reviews", fireId));
}

export { db, storage };
