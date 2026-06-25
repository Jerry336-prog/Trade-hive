// ============================================================
// Auth Service – Firebase Authentication operations
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { createUserDocument } from "./userService";

/**
 * Register a new user with email + password.
 * Creates the Firebase Auth account and a Firestore user document.
 */
export const registerUser = async ({ fullName, email, password, isVendor }) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update Firebase Auth display name
  await updateProfile(user, { displayName: fullName });

  // Create Firestore profile document
  await createUserDocument(user.uid, {
    uid: user.uid,
    fullName,
    email,
    phone: "",
    address: "",
    isVendor: !!isVendor,
    createdAt: new Date().toISOString(),
  });

  return user;
};

/**
 * Sign in an existing user.
 */
export const loginUser = async ({ email, password }) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Sign out the current user.
 */
export const logoutUser = async () => {
  await signOut(auth);
};
