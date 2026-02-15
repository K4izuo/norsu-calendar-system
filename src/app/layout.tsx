import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from '@/shared/components/context/auth-context';
import { RoleProvider } from '@/shared/components/context/user-role';
import { QueryProvider } from '@/core/lib/query-provider';

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "NORSU Calendar",
  description:
    "Negros Oriental State University Calendar System",
  authors: [{ name: "CJ" }],
  creator: "CJ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.className} custom-scrollbar min-h-screen bg-white antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <RoleProvider>
              {children}
            </RoleProvider>
          </AuthProvider>
        </QueryProvider>
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
              duration: 3000,
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </body>
    </html>
  );
}