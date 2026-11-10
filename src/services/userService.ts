
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

import { db } from "@/firebaseConfig";

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
        query(
            usersCollection,
            where("email", "==", email.trim().toLowerCase()),
        ),
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
    const apiKey = process.env.EXPO_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
        throw new Error("Thiếu EXPO_PUBLIC_IMGBB_API_KEY trong file .env.");
    }

    const response = await fetch(uri);
    if (!response.ok) throw new Error("Không thể đọc hình ảnh đã chọn.");

    const blob = await response.blob();
    const base64Image = await blobToBase64(blob);
    const body = new FormData();
    body.append("image", base64Image);

    const uploadResponse = await fetch(
        `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
        {
            method: "POST",
            body,
        },
    );
    const result: unknown = await uploadResponse.json();

    if (
        !uploadResponse.ok ||
        !isImgBbSuccessResponse(result) ||
        !result.data.url
    ) {
        throw new Error("ImgBB không thể tải hình ảnh lên.");
    }

    return result.data.url;
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result !== "string") {
                reject(new Error("Không thể chuyển hình ảnh sang base64."));
                return;
            }

            const base64 = reader.result.split(",")[1];
            if (!base64) {
                reject(new Error("Dữ liệu hình ảnh không hợp lệ."));
                return;
            }
            resolve(base64);
        };
        reader.onerror = () =>
            reject(new Error("Không thể đọc dữ liệu hình ảnh."));
        reader.readAsDataURL(blob);
    });
}

function isImgBbSuccessResponse(
    value: unknown,
): value is { data: { url: string } } {
    if (!value || typeof value !== "object" || !("data" in value)) return false;
    const data = value.data;
    return (
        !!data &&
        typeof data === "object" &&
        "url" in data &&
        typeof data.url === "string"
    );
}
