import { useEffect, useState } from "react";

function readNetworkStatus() {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(readNetworkStatus);

  useEffect(() => {
    const sync = () => setIsOnline(readNetworkStatus());
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return isOnline;
}
