'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/app/components/ui/Toast';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}
