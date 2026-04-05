import { useSyncExternalStore } from "react";

/** True only on the client after hydration — avoids SSR/client mismatch without setState-in-effect. */
export function useClientOnly() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
