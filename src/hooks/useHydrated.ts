import { useEffect, useState } from "react";

/** true somente depois da hidratação no navegador (IndexedDB só existe lá). */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
