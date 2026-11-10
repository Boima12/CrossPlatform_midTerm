import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your Firebase project configuration.
// You can find these values in the Firebase Console:
// Project Settings > General > Your apps > Web app > Firebase SDK snippet > Config
const firebaseConfig = {
    apiKey: "AIzaSyAcP0JSt5DteqzCJgRpHxriV45FnnMiIhU",
    authDomain: "dtdm-42cf7.firebaseapp.com",
    projectId: "dtdm-42cf7",
    storageBucket: "dtdm-42cf7.firebasestorage.app",
    messagingSenderId: "762779208916",
    appId: "1:762779208916:web:1c0ea18d1660a6b127ff41",
    measurementId: "G-VZW5TLE24B",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
