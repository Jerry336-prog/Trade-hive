// ============================================================
// User Service – Firestore user document operations
// ============================================================

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION = "users";

/**
 * Create a new user profile document in Firestore.
 */
export const createUserDocument = async (uid, data) => {
  const ref = doc(db, COLLECTION, uid);
  await setDoc(ref, data);
};

/**
 * Get a user's profile document.
 */
export const getUserDocument = async (uid) => {
  const ref = doc(db, COLLECTION, uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/**
 * Update a user's profile fields.
 */
export const updateUserDocument = async (uid, data) => {
  const ref = doc(db, COLLECTION, uid);
  await setDoc(ref, data, { merge: true });
};

/**
 * Upgrade a customer account to vendor status.
 */
export const upgradeToVendor = async (uid) => {
  const ref = doc(db, COLLECTION, uid);
  await setDoc(ref, { isVendor: true }, { merge: true });
};
