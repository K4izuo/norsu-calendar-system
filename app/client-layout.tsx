"use client";

import { useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { RoleProvider } from '@/contexts/user-role';
import { Toaster } from "react-hot-toast";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <AuthProvider>
        <RoleProvider>
          {children}
        </RoleProvider>
      </AuthProvider>

      {/* Only render Toaster after client-side mount */}
      {mounted && (
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10B981',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      )}
    </>
  );
}