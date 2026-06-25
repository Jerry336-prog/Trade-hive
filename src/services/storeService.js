// ============================================================
// Store Service – Firestore vendor store CRUD operations
// ============================================================

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION = "stores";

/**
 * Create a new vendor store.
 */
export const createStore = async (data) => {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

/**
 * Get a single store by its ID.
 */
export const getStore = async (storeId) => {
  const ref = doc(db, COLLECTION, storeId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/**
 * Get the store owned by a specific vendor.
 */
export const getStoreByOwner = async (ownerId) => {
  const q = query(collection(db, COLLECTION), where("ownerId", "==", ownerId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
};

/**
 * Get all stores.
 */
export const getAllStores = async () => {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Update store fields.
 */
export const updateStore = async (storeId, data) => {
  const ref = doc(db, COLLECTION, storeId);
  await updateDoc(ref, data);
};

/**
 * Delete a store.
 */
export const deleteStore = async (storeId) => {
  const ref = doc(db, COLLECTION, storeId);
  await deleteDoc(ref);
};
