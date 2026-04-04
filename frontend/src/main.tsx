import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootEl = document.getElementById("root");

async function enableMocking() {
  if (!import.meta.env.DEV) return;
  if (import.meta.env.VITE_USE_MSW === "false") return;
  const { worker } = await import("./mocks/browser");
  await worker.start({
    onUnhandledRequest: "bypass",
  });
}

if (!rootEl) {
  throw new Error("#root element not found");
}

void enableMocking().then(() => {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
