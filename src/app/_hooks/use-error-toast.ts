"use client";

import { useEffect } from "react";
import { toast } from "react-hot-toast";

export default function useErrorToast(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    if (!error) return;

    const hasShown = sessionStorage.getItem('last-toast-error');
    if (hasShown === error) {
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
      return;
    }

    sessionStorage.setItem('last-toast-error', error);

    const messages: Record<string, string> = {
      session_expired: "Session expired. Please log in again.",
      unauthorized: "Access denied. Please log in to view this page.",
    };

    const message = messages[error] || "An error occurred. Please try again.";
    toast.error(message, {
      duration: 5000,
      id: `toast-${error}-${Date.now()}`,
    });

    const url = new URL(window.location.href);
    url.searchParams.delete('error');
    window.history.replaceState({}, '', url.toString());

    setTimeout(() => sessionStorage.removeItem('last-toast-error'), 500);
  }, []);
}
