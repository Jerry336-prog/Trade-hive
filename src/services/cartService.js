// ============================================================
// Cart Service – Firestore cart CRUD operations
// Cart document ID = user's UID for easy lookup
// ============================================================

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION = "carts";

/**
 * Get a user's cart. Returns { userId, items: [] } or null.
 */
export const getCart = async (userId) => {
  const ref = doc(db, COLLECTION, userId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : { userId, items: [] };
};

/**
 * Save the entire cart (overwrite).
 */
export const saveCart = async (userId, items) => {
  const ref = doc(db, COLLECTION, userId);
  await setDoc(ref, { userId, items }, { merge: true });
};

/**
 * Clear a user's cart.
 */
export const clearCart = async (userId) => {
  const ref = doc(db, COLLECTION, userId);
  await updateDoc(ref, { items: [] });
};
