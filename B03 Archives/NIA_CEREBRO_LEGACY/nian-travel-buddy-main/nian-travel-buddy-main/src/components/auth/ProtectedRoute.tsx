import { ReactNode } from "react";

// MVP mode: no protection, render children directly
export function ProtectedRoute({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
