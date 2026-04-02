// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, doc,
  onSnapshot, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyBvSbp2STk05kmh6EaFQhUhdtxeQ9DYeas",
  authDomain:        "baark-wende-store.firebaseapp.com",
  projectId:         "baark-wende-store",
  storageBucket:     "baark-wende-store.firebasestorage.app",
  messagingSenderId: "136480310863",
  appId:             "1:136480310863:web:193a94fa26431526a04c3e",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// PRODUCTS
export function listenProducts(cb) {
  const q = query(collection(db,"products"), orderBy("createdAt","desc"));
  return onSnapshot(q, snap => cb(snap.docs.map(d=>({...d.data(),fireId:d.id}))), ()=>cb([]));
}
export const addProduct    = p  => addDoc(collection(db,"products"), {...p, createdAt:serverTimestamp()});
export const updateProduct = (id,d) => updateDoc(doc(db,"products",id), {...d, updatedAt:serverTimestamp()});
export const deleteProduct = id => deleteDoc(doc(db,"products",id));

// ORDERS
export function listenOrders(cb) {
  const q = query(collection(db,"orders"), orderBy("createdAt","desc"));
  return onSnapshot(q, snap => cb(snap.docs.map(d=>({...d.data(),fireId:d.id}))), ()=>cb([]));
}
export const addOrder          = o       => addDoc(collection(db,"orders"), {...o, createdAt:serverTimestamp()});
export const updateOrderStatus = (id,st) => updateDoc(doc(db,"orders",id), {status:st, updatedAt:serverTimestamp()});

// REVIEWS
export function listenReviews(cb) {
  const q = query(collection(db,"reviews"), orderBy("createdAt","desc"));
  return onSnapshot(q, snap => cb(snap.docs.map(d=>({...d.data(),fireId:d.id}))), ()=>cb([]));
}
export const addReview    = r       => addDoc(collection(db,"reviews"), {...r, createdAt:serverTimestamp()});
export const updateReview = (id,d)  => updateDoc(doc(db,"reviews",id), {...d, updatedAt:serverTimestamp()});
export const deleteReview = id      => deleteDoc(doc(db,"reviews",id));
