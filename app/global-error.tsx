"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 bg-background">
          <div className="text-center space-y-6 max-w-md">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Application Error</h2>
              <p className="text-muted-foreground">
                A critical error has occurred. Please refresh the page or
                contact support if the problem persists.
              </p>
            </div>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
