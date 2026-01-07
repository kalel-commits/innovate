import { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function signup(email, password, name, phone) {
        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Create Vendor Document
        await setDoc(doc(db, "vendors", user.uid), {
            email,
            name,
            phone,
            role: 'vendor',
            createdAt: new Date().toISOString()
        });

        return user;
    }

    async function login(email, password) {
        // 1. Sign In
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Check Verification (Vendor Role)
        const docRef = doc(db, "vendors", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            // Not a vendor
            await signOut(auth);
            throw new Error("Access Denied: Not a registered vendor account.");
        }

        return user;
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Double check existence on auto-login/refresh?
                // Optional: optimizing by not checking every single time if we trust the session, 
                // but for security "differential" requirement, checking is safer.
                const docRef = doc(db, "vendors", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setCurrentUser(user);
                } else {
                    // If they somehow have a session but aren't a vendor (e.g. logged in on Customer tab in same browser?)
                    // Sign them out from THIS app.
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
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
