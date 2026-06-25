// ============================================================
// Order Service – Firestore order CRUD operations
// ============================================================

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION = "orders";
const PRODUCT_COLLECTION = "products";

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
 * Place a new order.
 */
export const placeOrder = async (data) => {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    orderStatus: "Pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

/**
 * Place vendor-split orders and decrement product stock atomically.
 */
export const placeOrdersAndUpdateStock = async (orders) => {
  return runTransaction(db, async (transaction) => {
    const productRefs = new Map();
    const stockChanges = new Map();

    orders.forEach((order) => {
      order.products.forEach((item) => {
        const existing = stockChanges.get(item.productId) || {
          quantity: 0,
          name: item.name,
        };
        stockChanges.set(item.productId, {
          ...existing,
          quantity: existing.quantity + item.quantity,
        });

        if (!productRefs.has(item.productId)) {
          productRefs.set(item.productId, doc(db, PRODUCT_COLLECTION, item.productId));
        }
      });
    });

    const productSnapshots = new Map();
    for (const [productId, productRef] of productRefs) {
      const snap = await transaction.get(productRef);
      if (!snap.exists()) {
        throw new Error("A product in your cart is no longer available.");
      }
      productSnapshots.set(productId, snap);
    }

    for (const [productId, change] of stockChanges) {
      const snap = productSnapshots.get(productId);
      const currentStock = Number(snap.data().stock || 0);
      if (currentStock < change.quantity) {
        throw new Error(`${change.name} only has ${currentStock} left in stock.`);
      }
      transaction.update(productRefs.get(productId), {
        stock: currentStock - change.quantity,
      });
    }

    const orderIds = [];
    orders.forEach((order) => {
      const orderRef = doc(collection(db, COLLECTION));
      transaction.set(orderRef, {
        ...order,
        orderStatus: "Pending",
        createdAt: serverTimestamp(),
      });
      orderIds.push(orderRef.id);
    });

    return orderIds;
  });
};

/**
 * Get a single order by ID.
 */
export const getOrder = async (orderId) => {
  const ref = doc(db, COLLECTION, orderId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/**
 * Get all orders placed by a customer.
 */
export const getOrdersByCustomer = async (customerId) => {
  const q = query(
    collection(db, COLLECTION),
    where("customerId", "==", customerId)
  );
  const snap = await getDocs(q);
  return sortByNewest(mapSnapshot(snap));
};

/**
 * Subscribe to all orders placed by a customer.
 */
export const subscribeToOrdersByCustomer = (customerId, onNext, onError) => {
  const q = query(collection(db, COLLECTION), where("customerId", "==", customerId));
  return onSnapshot(q, (snap) => onNext(sortByNewest(mapSnapshot(snap))), onError);
};

/**
 * Get all orders received by a vendor.
 */
export const getOrdersByVendor = async (vendorId) => {
  const q = query(
    collection(db, COLLECTION),
    where("vendorId", "==", vendorId)
  );
  const snap = await getDocs(q);
  return sortByNewest(mapSnapshot(snap));
};

/**
 * Subscribe to all orders received by a vendor.
 */
export const subscribeToOrdersByVendor = (vendorId, onNext, onError) => {
  const q = query(collection(db, COLLECTION), where("vendorId", "==", vendorId));
  return onSnapshot(q, (snap) => onNext(sortByNewest(mapSnapshot(snap))), onError);
};

/**
 * Update an order's status.
 */
export const updateOrderStatus = async (orderId, status) => {
  const ref = doc(db, COLLECTION, orderId);
  await updateDoc(ref, { orderStatus: status });
};
