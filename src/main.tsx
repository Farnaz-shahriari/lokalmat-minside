import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { AppStateProvider } from "./state/AppState";
/* MapLibre's own control/popup CSS. Imported from the package rather than a
   CDN so the map has no external dependency at runtime. */
import "maplibre-gl/dist/maplibre-gl.css";
import "./styles/app.css";

/* .theme-lokalmat is what selects this platform's tokens out of the design
   system's tokens.css. Every other Norsk Mat platform is one class swap away. */
document.documentElement.classList.add("theme-lokalmat");
document.documentElement.lang = "nb";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* basename keeps routing correct under a GitHub Pages project path. */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </BrowserRouter>
  </StrictMode>,
);
