import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";
import { ThemeProvider } from "./components/brand/ThemeProvider.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ReferenceProvider } from "./context/ReferenceContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ReferenceProvider>
            <App />
          <Toaster
            position="top-right"
            gutter={10}
            toastOptions={{
              duration: 4000,
              className: "surface !rounded-md !border-line !bg-surface !text-ink !shadow-e3",
              success: { iconTheme: { primary: "var(--color-success)", secondary: "#fff" } },
              error: { iconTheme: { primary: "var(--color-danger)", secondary: "#fff" } },
            }}
          />
          </ReferenceProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
