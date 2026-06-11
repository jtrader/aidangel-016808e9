import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Capture the PWA install prompt as early as possible — before any component mounts.
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  (window as typeof window & { __bipEvent?: Event }).__bipEvent = e;
});

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for offline support (production only).
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* ignore registration errors */
    });
  });
}
