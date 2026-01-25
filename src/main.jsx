import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

const root = createRoot(rootEl);

try {
  root.render(<App />);
} catch (err) {
  console.error("App failed to render:", err);
  rootEl.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.5rem;font-family:system-ui,sans-serif;text-align:center;">
      <h1 style="font-size:1.25rem;margin-bottom:0.5rem;">Something went wrong</h1>
      <p style="color:#666;font-size:0.875rem;margin-bottom:1rem;">The app failed to load. Try <a href="/">reloading</a> or check the console.</p>
      <pre style="text-align:left;font-size:0.75rem;background:#f1f5f9;padding:1rem;border-radius:0.5rem;overflow:auto;max-height:12rem;">${String(err?.message ?? err)}</pre>
    </div>
  `;
}
