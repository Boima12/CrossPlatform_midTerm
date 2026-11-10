import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { db, storage } from "@/firebaseConfig";

export interface User {
  id: string;
  email: string;
  matkhau: string;
  hoten: string;
  hinhanh: string;
}

export type UserFields = Omit<User, "id">;

const usersCollection = collection(db, "users");
let authenticatedUser: User | null = null;

export function setAuthenticatedUser(user: User | null): void {
  authenticatedUser = user;
}

export function getAuthenticatedUser(): User | null {
  return authenticatedUser;
}

export function subscribeToUsers(
  onUsers: (users: User[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    usersCollection,
    (snapshot) => {
      const users = snapshot.docs.map((userDoc) => ({
        id: userDoc.id,
        ...(userDoc.data() as UserFields),
      }));
      onUsers(users);
    },
    onError,
  );
}

export async function authenticateUser(
  email: string,
  matkhau: string,
): Promise<User | null> {
  const result = await getDocs(
    query(usersCollection, where("email", "==", email.trim().toLowerCase())),
  );

  const matchingDocument = result.docs.find(
    (userDoc) => userDoc.data().matkhau === matkhau,
  );
  if (!matchingDocument) return null;

  return {
    id: matchingDocument.id,
    ...(matchingDocument.data() as UserFields),
  };
}

export async function createUser(fields: UserFields): Promise<void> {
  await addDoc(usersCollection, fields);
}

export async function updateUser(
  id: string,
  fields: UserFields,
): Promise<void> {
  await updateDoc(doc(db, "users", id), fields);
}

export async function deleteUser(id: string): Promise<void> {
  await deleteDoc(doc(db, "users", id));
}

export async function uploadUserImage(uri: string): Promise<string> {
  const response = await fetch(uri);
  if (!response.ok) throw new Error("Không thể đọc hình ảnh đã chọn.");

  const blob = await response.blob();
  const imageRef = ref(storage, `user-images/${Date.now()}.jpg`);
  await uploadBytes(imageRef, blob, { contentType: blob.type || "image/jpeg" });
  return getDownloadURL(imageRef);
}
