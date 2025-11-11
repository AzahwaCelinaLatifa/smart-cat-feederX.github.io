import React from 'react'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Service worker handling
if ('serviceWorker' in navigator) {
  const isProd = import.meta.env.MODE === 'production';
  if (isProd) {
    // Register only in production
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered:', registration);
          // Attempt update check
          registration.update?.();
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    });
  } else {
    // In dev, ensure no stale SW interferes with Vite dev server
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
    navigator.serviceWorker.getRegistration().then((r) => r?.unregister());
    // Also try to remove any existing caches created by the SW
    if ('caches' in window) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    }
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
