'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    role: 'admin' | 'student' | null;
    loading: boolean;
    refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    refreshRole: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'admin' | 'student' | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCached, setIsCached] = useState(false);

    // --- 1. Synchronous Pre-hydration from Cache (UI only) ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedUser = localStorage.getItem('infraMind_user_cache');
            if (savedUser) {
                try {
                    const parsed = JSON.parse(savedUser);
                    // Use cached role instantly for UI
                    const cachedRole = localStorage.getItem(`infraMind_role_${parsed.uid}`) as any;
                    if (cachedRole) setRole(cachedRole);

                    setIsCached(true);
                    setLoading(false); // Unblock UI early
                } catch (e) {
                    console.error("Cache parse error:", e);
                }
            } else {
                // No cache, wait for Firebase
            }
        }
    }, []);

    const refreshRole = async () => {
        if (auth?.currentUser && db) {
            try {
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                if (userDoc.exists()) {
                    const newRole = userDoc.data().role as 'admin' | 'student';
                    setRole(newRole);
                    localStorage.setItem(`infraMind_role_${auth.currentUser.uid}`, newRole);
                } else {
                    setRole('student');
                }
            } catch (error: any) {
                if (error?.code !== 'unavailable' && !error?.message?.includes('offline')) {
                    console.error("Error refreshing user role:", error);
                }
            }
        }
    };

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                setUser(null);
                setRole(null);
                setIsCached(false);
                localStorage.removeItem('infraMind_user_cache');
                setLoading(false);
                return;
            }

            if (currentUser) {
                setUser(currentUser);
                setIsCached(false); // We have a REAL user now

                // Sync Cache
                const minimalUser = {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                };
                localStorage.setItem('infraMind_user_cache', JSON.stringify(minimalUser));

                // Speed up redirect if we have a cached role
                const cachedRole = localStorage.getItem(`infraMind_role_${currentUser.uid}`) as any;
                if (cachedRole) setRole(cachedRole);

                // EXTREMELY IMPORTANT: Set loading(false) as soon as user is verified
                // This makes the transition from Login -> Dashboard feel instant
                setLoading(false);

                // --- Background Tasks ---
                // 1. Link anonymous tickets
                const sessionId = localStorage.getItem('infraMindSessionId');
                if (sessionId) {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                    fetch(`${apiUrl}/api/complaints/link`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionId, user_uid: currentUser.uid })
                    }).catch(() => { });
                }

                // 2. Refresh Role from Firestore if possible
                if (db) {
                    try {
                        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                        if (userDoc.exists()) {
                            const newRole = userDoc.data().role as any;
                            setRole(newRole);
                            localStorage.setItem(`infraMind_role_${currentUser.uid}`, newRole);
                        } else {
                            if (!cachedRole) setRole('student');
                        }
                    } catch (e) {
                        if (!cachedRole) setRole('student');
                    }
                }
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            role,
            loading: loading && !isCached, // If UI is cached, loading is false for views
            refreshRole
        }}>
            {children}
        </AuthContext.Provider>
    );
};
