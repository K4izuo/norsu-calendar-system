import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from '@/contexts/auth-context';
import { RoleProvider } from '@/contexts/user-role';

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
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
    <html lang="en">
      <body
        className={`${poppins.className} custom-scrollbar min-h-screen bg-white antialiased`}
      >
        <AuthProvider>
          <RoleProvider>
            {children}
          </RoleProvider>
        </AuthProvider>
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
      </body>
    </html>
  );
}