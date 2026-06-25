// ============================================================
// Product Service – Firestore product CRUD operations
// ============================================================

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION = "products";

const getCreatedAtMillis = (value) => {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  return new Date(value).getTime() || 0;
};

const sortByNewest = (items) =>
  [...items].sort((a, b) => getCreatedAtMillis(b.createdAt) - getCreatedAtMillis(a.createdAt));

const mapSnapshot = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

/**
 * Add a new product.
 */
export const addProduct = async (data) => {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

/**
 * Get a single product by ID.
 */
export const getProduct = async (productId) => {
  const ref = doc(db, COLLECTION, productId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/**
 * Subscribe to a single product by ID.
 */
export const subscribeToProduct = (productId, onNext, onError) => {
  const ref = doc(db, COLLECTION, productId);
  return onSnapshot(ref, (snap) => onNext(snap.exists() ? { id: snap.id, ...snap.data() } : null), onError);
};

/**
 * Get all products (optionally filtered by category).
 */
export const getAllProducts = async (category = null) => {
  let q;
  if (category && category !== "All") {
    q = query(
      collection(db, COLLECTION),
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Subscribe to all products.
 */
export const subscribeToAllProducts = (onNext, onError) => {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => onNext(mapSnapshot(snap)), onError);
};

/**
 * Get all products belonging to a specific vendor.
 */
export const getProductsByVendor = async (vendorId) => {
  const q = query(
    collection(db, COLLECTION),
    where("vendorId", "==", vendorId)
  );
  const snap = await getDocs(q);
  return sortByNewest(mapSnapshot(snap));
};

/**
 * Subscribe to all products belonging to a specific vendor.
 */
export const subscribeToProductsByVendor = (vendorId, onNext, onError) => {
  const q = query(collection(db, COLLECTION), where("vendorId", "==", vendorId));
  return onSnapshot(q, (snap) => onNext(sortByNewest(mapSnapshot(snap))), onError);
};

/**
 * Get all products belonging to a specific store.
 */
export const getProductsByStore = async (storeId) => {
  const q = query(
    collection(db, COLLECTION),
    where("storeId", "==", storeId)
  );
  const snap = await getDocs(q);
  return sortByNewest(mapSnapshot(snap));
};

/**
 * Update a product's fields.
 */
export const updateProduct = async (productId, data) => {
  const ref = doc(db, COLLECTION, productId);
  await updateDoc(ref, data);
};

/**
 * Delete a product.
 */
export const deleteProduct = async (productId) => {
  const ref = doc(db, COLLECTION, productId);
  await deleteDoc(ref);
};
