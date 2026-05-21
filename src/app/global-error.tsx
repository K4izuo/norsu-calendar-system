"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Root error boundary:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "28rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", margin: 0, fontWeight: 600 }}>
            Application error
          </h1>
          <p style={{ color: "#525252", margin: 0, lineHeight: 1.5 }}>
            A critical error occurred and the page could not be displayed.
          </p>
          {error.digest && (
            <p
              style={{
                color: "#737373",
                fontSize: "0.75rem",
                fontFamily: "monospace",
                margin: 0,
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              border: "none",
              background: "#0f172a",
              color: "white",
              cursor: "pointer",
              fontSize: "0.875rem",
              alignSelf: "center",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
