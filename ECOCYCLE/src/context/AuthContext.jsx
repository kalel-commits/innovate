import { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';
import { auth } from '../firebase'; // Assuming 'db' is exported from here or we init it

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const db = getFirestore(auth.app); // Get db instance associated with the auth app

    async function signup(email, password, name = '', phone = '') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create Customer Document
        await setDoc(doc(db, "customers", user.uid), {
            email,
            role: 'customer',
            createdAt: new Date().toISOString(),
            // Add other fields if needed for validation
            name: name,
            phone: phone
        });

        return user;
    }

    async function login(email, password) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check verification: Must be a customer
        const docRef = doc(db, "customers", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            // User exists in Auth (maybe a Vendor), but not as a Customer
            await signOut(auth);
            throw new Error("Access Denied: Not a registered customer account.");
        }

        return user;
    }

    function logout() {
        return signOut(auth);
    }

    async function googleSignIn() {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // For Google Auth, we might need to create the doc if it doesn't exist
        const docRef = doc(db, "customers", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            // Check if they are a vendor trying to log in? 
            // Or just create a new customer record? 
            // For now, let's assume new Google sign-ins are customers.
            await setDoc(docRef, {
                email: user.email,
                role: 'customer',
                createdAt: new Date().toISOString(),
                name: user.displayName || '',
                phone: ''
            });
        } else {
            // If document exists, ensure it is a customer
            if (docSnap.data().role !== 'customer') {
                await signOut(auth);
                throw new Error("Access Denied: Not a registered customer account.");
            }
        }

        return result;
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Verify role on reload
                const docRef = doc(db, "customers", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data().role === 'customer') {
                    setCurrentUser(user);
                } else {
                    // Not a customer (or doc missing)
                    await signOut(auth);
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signup,
        login,
        logout,
        googleSignIn
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
