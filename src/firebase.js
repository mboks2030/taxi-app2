import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

/**
 * AUTO-CONFIGURED FIREBASE
 * These keys were automatically fetched from your project: my1stpro-3d6aa
 */
const firebaseConfig = {
    apiKey: "AIzaSyDboDVr5-HJZWn5Mcq4ZxJTVo0l_1XowgE",
    authDomain: "my1stpro-3d6aa.firebaseapp.com",
    projectId: "my1stpro-3d6aa",
    storageBucket: "my1stpro-3d6aa.firebasestorage.app",
    messagingSenderId: "630314946891",
    appId: "1:630314946891:web:898f01afcd03be1e7b58ce",
    measurementId: "G-EBPPX4N28W"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };
