import { useEffect, useState } from "react";

export const FullScreenLoader = ({ className }: { className?: string }) => {
  // Vite's BASE_URL can be '' in some dev setups; avoid `new URL()` which requires
  // an absolute base URL.
  const base = import.meta.env.BASE_URL ?? "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const logoSrc = `${normalizedBase}logo.png`;
  return (
    <div className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center ${className ?? ""}`}>
      <div className="relative flex items-center justify-center">
        <img
          src={logoSrc}
          alt="Loading"
          className="w-32 h-32 animate-spin-slow"
        />
        <div className="absolute w-40 h-40 rounded-full bg-yellow-400 opacity-20 blur-2xl" />
      </div>
    </div>
  );
};

/**
 * Boot splash: shows until the browser fires `load`.
 * This is useful for the very first paint, independent of route-loading.
 */
const Loader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => setLoading(false), 500);
    };

    // Safety: never block the app forever.
    const safetyTimer = window.setTimeout(() => setLoading(false), 5000);

    if (document.readyState === "complete") {
      handleLoad();
      return () => window.clearTimeout(safetyTimer);
    }

    window.addEventListener("load", handleLoad);
    return () => {
      window.removeEventListener("load", handleLoad);
      window.clearTimeout(safetyTimer);
    };
  }, []);

  if (!loading) return null;
  return <FullScreenLoader />;
};

export default Loader;